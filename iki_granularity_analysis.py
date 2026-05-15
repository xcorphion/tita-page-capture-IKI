"""
OMMΩ — IKI Granularity Analysis
================================
Calcula correlação IKI vs EMA (valência + arousal)
em 3 granularidades: caractere, palavra, sentença.

Responde a pergunta do painel:
  "Onde o sinal somático é mais forte?"
  → caractere: arquitetura própria justificada
  → palavra/sentença: agregação por token funciona

Uso:
  python iki_granularity_analysis.py --file ohana_data_full.json
  python iki_granularity_analysis.py --file ohana_data_full.json --all-participants

Autor: OMMΩ Pipeline
"""

import json
import argparse
import numpy as np
from pathlib import Path
from scipy import stats
from dataclasses import dataclass, field
from typing import Optional

# ─── Configuração ────────────────────────────────────────────────────────────

IKI_MIN_MS   = 30       # abaixo disso é rollover ou erro de hardware
IKI_MAX_MS   = 10_000   # acima disso é pausa intencional (não sinal motor)
MODIFIER_KEYS = {
    "ShiftLeft", "ShiftRight", "AltLeft", "AltRight",
    "ControlLeft", "ControlRight", "MetaLeft", "MetaRight",
    "F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12",
    "ArrowLeft","ArrowRight","ArrowUp","ArrowDown",
    "Home","End","PageUp","PageDown","Insert","Delete",
    "CapsLock","Tab","Escape","Enter"
}

# ─── Estruturas de dados ─────────────────────────────────────────────────────

@dataclass
class EMAPoint:
    timestamp_rel_ms: float
    valence: float
    arousal: float
    character_count: int

@dataclass
class GranularityResult:
    level: str          # "character", "word", "sentence"
    n_points: int
    r_valence: float
    r_arousal: float
    p_valence: float
    p_arousal: float
    iki_values: list
    valence_values: list
    arousal_values: list

# ─── Carregamento do JSON ─────────────────────────────────────────────────────

def load_participant_data(filepath: str) -> dict:
    """Carrega JSON do participante — suporta formato flat ou nested."""
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

def extract_events_and_emas(data: dict) -> tuple[list, list]:
    """
    Extrai eventos keydown e EMAs do JSON.
    Suporta múltiplos formatos de export do banco.
    """
    events = []
    emas   = []

    # Formato 1: chaves diretas
    if "events" in data:
        raw_events = data["events"]
    # Formato 2: aninhado em sessions
    elif "sessions" in data:
        raw_events = []
        for session in data["sessions"]:
            raw_events.extend(session.get("events", []))
    else:
        raise ValueError("JSON não contém 'events' nem 'sessions'")

    # Filtrar só keydown, excluir modificadores
    for e in raw_events:
        if e.get("event_type") != "keydown":
            continue
        key = e.get("key_code") or e.get("key") or ""
        if key in MODIFIER_KEYS:
            continue
        ts = e.get("timestamp_rel_ms") or e.get("timestamp")
        if ts is None:
            continue
        events.append({
            "timestamp_rel_ms": float(ts),
            "key": key
        })

    # Extrair EMAs
    raw_emas = data.get("emas", [])
    if not raw_emas and "sessions" in data:
        for session in data["sessions"]:
            raw_emas.extend(session.get("emas", []))

    for ema in raw_emas:
        ts  = ema.get("timestamp_rel_ms") or ema.get("timestamp")
        val = ema.get("valence") or ema.get("valence_score")
        ar  = ema.get("arousal") or ema.get("arousal_score")
        cc  = ema.get("character_count", 0)
        if None in (ts, val, ar):
            continue
        emas.append(EMAPoint(
            timestamp_rel_ms=float(ts),
            valence=float(val),
            arousal=float(ar),
            character_count=int(cc)
        ))

    # Ordenar por timestamp
    events.sort(key=lambda x: x["timestamp_rel_ms"])
    emas.sort(key=lambda x: x.timestamp_rel_ms)

    return events, emas

# ─── Cálculo de IKIs ─────────────────────────────────────────────────────────

def compute_ikis(events: list) -> list[dict]:
    """
    Calcula IKIs entre keydowns consecutivos.
    Retorna lista de {iki_ms, timestamp_rel_ms, key}.
    """
    ikis = []
    for i in range(1, len(events)):
        dt = events[i]["timestamp_rel_ms"] - events[i-1]["timestamp_rel_ms"]
        if IKI_MIN_MS <= dt <= IKI_MAX_MS:
            ikis.append({
                "iki_ms": dt,
                "timestamp_rel_ms": events[i]["timestamp_rel_ms"],
                "key": events[i]["key"]
            })
    return ikis

# ─── Segmentação por EMA ─────────────────────────────────────────────────────

def assign_ikis_to_ema_segments(
    ikis: list[dict],
    emas: list[EMAPoint]
) -> list[dict]:
    """
    Associa cada IKI ao segmento EMA mais próximo (anterior).
    Retorna lista de IKIs com campo ema_index.
    """
    if not emas:
        return []

    annotated = []
    ema_times = [e.timestamp_rel_ms for e in emas]

    for iki in ikis:
        ts = iki["timestamp_rel_ms"]
        # Encontrar o EMA anterior mais recente
        idx = -1
        for j, et in enumerate(ema_times):
            if et <= ts:
                idx = j
            else:
                break
        if idx == -1:
            continue  # IKI antes do primeiro EMA — ignorar
        annotated.append({**iki, "ema_index": idx})

    return annotated

# ─── Granularidade: CARACTERE ─────────────────────────────────────────────────

def analyze_character_level(
    annotated_ikis: list[dict],
    emas: list[EMAPoint]
) -> GranularityResult:
    """
    Nível caractere: cada IKI individual vs EMA do segmento.
    É a granularidade mais fina — mais ruidosa, mais resolução.
    """
    iki_vals, val_vals, ar_vals = [], [], []

    for item in annotated_ikis:
        ema = emas[item["ema_index"]]
        iki_vals.append(item["iki_ms"])
        val_vals.append(ema.valence)
        ar_vals.append(ema.arousal)

    if len(iki_vals) < 3:
        return _empty_result("character")

    r_val, p_val = stats.pearsonr(iki_vals, val_vals)
    r_ar,  p_ar  = stats.pearsonr(iki_vals, ar_vals)

    return GranularityResult(
        level="character",
        n_points=len(iki_vals),
        r_valence=r_val, p_valence=p_val,
        r_arousal=r_ar,  p_arousal=p_ar,
        iki_values=iki_vals,
        valence_values=val_vals,
        arousal_values=ar_vals
    )

# ─── Granularidade: PALAVRA e SENTENÇA (segmentação temporal) ────────────────
#
# O banco não grava key_code para letras normais (campo vazio).
# Solução: usar IKI como proxy de fronteira.
#
# Lógica biológica:
#   Entre letras da mesma palavra: IKI ~80-200ms (fluência motora)
#   Após espaço (entre palavras):  IKI ~200-600ms (pausa leve)
#   Após ponto/vírgula (sentença): IKI ~600ms+    (pausa cognitiva)
#
# Thresholds calculados a partir da distribuição da Ohana:
#   mediana=217ms, std=230ms → word_threshold ≈ mediana + 0.5*std ≈ 330ms
#   sentence_threshold ≈ mediana + 1.5*std ≈ 560ms
#
# Se key_code estiver disponível (Backspace, Enter etc.), usa também.

WORD_THRESHOLD_MS     = 330   # IKI acima disso = provável fronteira de palavra
SENTENCE_THRESHOLD_MS = 560   # IKI acima disso = provável fronteira de sentença
SPECIAL_WORD_KEYS     = {"Space", "space", " ", ",", ";", ":", ")", "]"}
SPECIAL_SENTENCE_KEYS = {"Enter", "Return", ".", "!", "?"}


def _is_word_boundary(item: dict) -> bool:
    key = item.get("key", "")
    if key in SPECIAL_WORD_KEYS or key in SPECIAL_SENTENCE_KEYS:
        return True
    return item["iki_ms"] >= WORD_THRESHOLD_MS


def _is_sentence_boundary(item: dict) -> bool:
    key = item.get("key", "")
    if key in SPECIAL_SENTENCE_KEYS:
        return True
    return item["iki_ms"] >= SENTENCE_THRESHOLD_MS


def analyze_word_level(
    annotated_ikis: list[dict],
    emas: list[EMAPoint]
) -> GranularityResult:
    """
    Nível palavra: agrupa IKIs entre fronteiras de palavra.
    Fronteira detectada por IKI >= WORD_THRESHOLD_MS ou tecla especial.
    Usa IKI médio por palavra vs EMA do segmento.
    """
    word_groups: dict[tuple, list] = {}
    current_word_id = 0
    last_ema = -1

    for item in annotated_ikis:
        ema_idx = item["ema_index"]
        if ema_idx != last_ema:
            current_word_id += 1
            last_ema = ema_idx

        grp_key = (ema_idx, current_word_id)
        word_groups.setdefault(grp_key, []).append(item["iki_ms"])

        if _is_word_boundary(item):
            current_word_id += 1

    iki_mean_vals, val_vals, ar_vals = [], [], []

    for (ema_idx, _), group_ikis in word_groups.items():
        if len(group_ikis) < 2:
            continue
        ema = emas[ema_idx]
        iki_mean_vals.append(np.mean(group_ikis))
        val_vals.append(ema.valence)
        ar_vals.append(ema.arousal)

    if len(iki_mean_vals) < 3:
        return _empty_result("word")

    r_val, p_val = stats.pearsonr(iki_mean_vals, val_vals)
    r_ar,  p_ar  = stats.pearsonr(iki_mean_vals, ar_vals)

    return GranularityResult(
        level="word",
        n_points=len(iki_mean_vals),
        r_valence=r_val, p_valence=p_val,
        r_arousal=r_ar,  p_arousal=p_ar,
        iki_values=iki_mean_vals,
        valence_values=val_vals,
        arousal_values=ar_vals
    )

# ─── Granularidade: SENTENÇA ──────────────────────────────────────────────────

def analyze_sentence_level(
    annotated_ikis: list[dict],
    emas: list[EMAPoint]
) -> GranularityResult:
    """
    Nível sentença: agrupa IKIs entre fronteiras de sentença.
    Fronteira detectada por IKI >= SENTENCE_THRESHOLD_MS ou tecla especial.
    Usa IKI médio por sentença vs EMA do segmento.
    """
    sentence_groups: dict[tuple, list] = {}
    current_sent_id = 0
    last_ema = -1

    for item in annotated_ikis:
        ema_idx = item["ema_index"]
        if ema_idx != last_ema:
            current_sent_id += 1
            last_ema = ema_idx

        grp_key = (ema_idx, current_sent_id)
        sentence_groups.setdefault(grp_key, []).append(item["iki_ms"])

        if _is_sentence_boundary(item):
            current_sent_id += 1

    iki_mean_vals, val_vals, ar_vals = [], [], []

    for (ema_idx, _), group_ikis in sentence_groups.items():
        if len(group_ikis) < 3:
            continue
        ema = emas[ema_idx]
        iki_mean_vals.append(np.mean(group_ikis))
        val_vals.append(ema.valence)
        ar_vals.append(ema.arousal)

    if len(iki_mean_vals) < 3:
        return _empty_result("sentence")

    r_val, p_val = stats.pearsonr(iki_mean_vals, val_vals)
    r_ar,  p_ar  = stats.pearsonr(iki_mean_vals, ar_vals)

    return GranularityResult(
        level="sentence",
        n_points=len(iki_mean_vals),
        r_valence=r_val, p_valence=p_val,
        r_arousal=r_ar,  p_arousal=p_ar,
        iki_values=iki_mean_vals,
        valence_values=val_vals,
        arousal_values=ar_vals
    )

# ─── Helpers ──────────────────────────────────────────────────────────────────

def _empty_result(level: str) -> GranularityResult:
    return GranularityResult(
        level=level, n_points=0,
        r_valence=float("nan"), r_arousal=float("nan"),
        p_valence=float("nan"), p_arousal=float("nan"),
        iki_values=[], valence_values=[], arousal_values=[]
    )

def log1p_normalize(values: list[float]) -> list[float]:
    """Normalização log1p — padrão OMMΩ para IKIs."""
    arr = np.array(values, dtype=float)
    arr = np.log1p(arr)
    mean, std = arr.mean(), arr.std()
    if std > 0:
        arr = (arr - mean) / std
    return arr.tolist()

# ─── Relatório ────────────────────────────────────────────────────────────────

PANEL_THRESHOLD = 0.3  # r acima disso é sinal considerável

def print_report(participant_id: str, results: list[GranularityResult]):
    """Imprime relatório formatado para o painel."""
    print("\n" + "═" * 60)
    print(f"  OMMΩ — Granularity Analysis: {participant_id}")
    print("═" * 60)

    print(f"\n{'Nível':<12} {'N':>6} {'r(val)':>8} {'p(val)':>8} {'r(ar)':>8} {'p(ar)':>8}")
    print("─" * 60)

    strongest_signal = None
    strongest_r = 0.0

    for r in results:
        if r.n_points == 0:
            print(f"{r.level:<12} {'—':>6}")
            continue

        flag_val = " ★" if abs(r.r_valence) >= PANEL_THRESHOLD else ""
        flag_ar  = " ★" if abs(r.r_arousal) >= PANEL_THRESHOLD else ""

        print(
            f"{r.level:<12} {r.n_points:>6} "
            f"{r.r_valence:>+8.3f}{flag_val}  "
            f"{r.p_valence:>7.4f} "
            f"{r.r_arousal:>+8.3f}{flag_ar}  "
            f"{r.p_arousal:>7.4f}"
        )

        max_r = max(abs(r.r_valence), abs(r.r_arousal))
        if max_r > strongest_r:
            strongest_r = max_r
            strongest_signal = r.level

    print("\n" + "─" * 60)
    print(f"  Sinal mais forte: {strongest_signal} (r={strongest_r:.3f})")
    print("─" * 60)

    # Veredicto arquitetural
    print("\n  VEREDICTO ARQUITETURAL:")
    if strongest_signal == "character":
        print("  → Sinal dominante em CARACTERE")
        print("  → Arquitetura própria justificada")
        print("  → Tokenização por caractere preserva sinal")
    elif strongest_signal == "word":
        print("  → Sinal dominante em PALAVRA")
        print("  → Agregação por token é suficiente")
        print("  → Fine-tuning em Qwen3 7B é viável")
    elif strongest_signal == "sentence":
        print("  → Sinal dominante em SENTENÇA")
        print("  → Agregação por token funciona bem")
        print("  → Stream somático pode operar em nível alto")
    else:
        print("  → Sinal fraco em todos os níveis")
        print("  → Coletar mais participantes antes de decidir")

    print("\n  ★ = r ≥ 0.30 (limiar do painel)\n")

def save_results_json(participant_id: str, results: list[GranularityResult], outpath: str):
    """Salva resultados em JSON para uso no pipeline."""
    output = {
        "participant_id": participant_id,
        "granularity_analysis": []
    }
    for r in results:
        output["granularity_analysis"].append({
            "level": r.level,
            "n_points": r.n_points,
            "r_valence": round(r.r_valence, 4) if not np.isnan(r.r_valence) else None,
            "p_valence": round(r.p_valence, 4) if not np.isnan(r.p_valence) else None,
            "r_arousal": round(r.r_arousal, 4) if not np.isnan(r.r_arousal) else None,
            "p_arousal": round(r.p_arousal, 4) if not np.isnan(r.p_arousal) else None,
        })
    with open(outpath, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print(f"  Resultados salvos em: {outpath}")

# ─── Pipeline principal ───────────────────────────────────────────────────────

def analyze_participant(filepath: str) -> list[GranularityResult]:
    """Pipeline completo para um participante."""
    data = load_participant_data(filepath)
    events, emas = extract_events_and_emas(data)

    print(f"  Eventos keydown válidos: {len(events)}")
    print(f"  EMAs encontrados:        {len(emas)}")

    if len(events) < 10 or len(emas) < 3:
        print("  ⚠ Dados insuficientes para análise.")
        return []

    ikis = compute_ikis(events)
    print(f"  IKIs calculados:         {len(ikis)}")
    print(f"  IKIs após filtro:        {len([i for i in ikis if IKI_MIN_MS <= i['iki_ms'] <= IKI_MAX_MS])}")

    annotated = assign_ikis_to_ema_segments(ikis, emas)
    print(f"  IKIs associados a EMAs:  {len(annotated)}\n")

    results = [
        analyze_character_level(annotated, emas),
        analyze_word_level(annotated, emas),
        analyze_sentence_level(annotated, emas),
    ]
    return results

# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="OMMΩ — IKI Granularity Analysis"
    )
    parser.add_argument(
        "--file", "-f",
        required=True,
        help="Caminho para o JSON do participante"
    )
    parser.add_argument(
        "--participant-id", "-p",
        default=None,
        help="ID do participante (inferido do nome do arquivo se omitido)"
    )
    parser.add_argument(
        "--save-json",
        action="store_true",
        help="Salvar resultados em JSON além do relatório no terminal"
    )
    parser.add_argument(
        "--log1p",
        action="store_true",
        default=True,
        help="Aplicar normalização log1p nos IKIs (padrão: ativo)"
    )
    parser.add_argument(
        "--debug-keys",
        action="store_true",
        help="Mostrar os 30 valores únicos do campo key para diagnóstico"
    )
    args = parser.parse_args()

    filepath = Path(args.file)
    if not filepath.exists():
        print(f"❌ Arquivo não encontrado: {filepath}")
        return

    participant_id = args.participant_id or filepath.stem.upper()

    print(f"\n  Analisando: {filepath.name}")
    print(f"  Participante: {participant_id}")
    print(f"  Normalização log1p: {'ativa' if args.log1p else 'desativada'}")

    data = load_participant_data(str(filepath))
    events, emas = extract_events_and_emas(data)

    if args.debug_keys:
        unique_keys = sorted(set(e["key"] for e in events))[:40]
        print(f"\n  DEBUG — valores únicos do campo 'key' (até 40):")
        print(f"  {unique_keys}\n")

    print(f"  Eventos keydown válidos: {len(events)}")
    print(f"  EMAs encontrados:        {len(emas)}")

    if len(events) < 10 or len(emas) < 3:
        print("  ⚠ Dados insuficientes para análise.")
        return

    ikis = compute_ikis(events)
    print(f"  IKIs calculados:         {len(ikis)}")
    print(f"  IKIs após filtro:        {len([i for i in ikis if IKI_MIN_MS <= i['iki_ms'] <= IKI_MAX_MS])}")

    annotated = assign_ikis_to_ema_segments(ikis, emas)
    print(f"  IKIs associados a EMAs:  {len(annotated)}\n")

    results = [
        analyze_character_level(annotated, emas),
        analyze_word_level(annotated, emas),
        analyze_sentence_level(annotated, emas),
    ]

    if not results:
        return

    print_report(participant_id, results)

    if args.save_json:
        out = filepath.parent / f"{filepath.stem}_granularity.json"
        save_results_json(participant_id, results, str(out))

if __name__ == "__main__":
    main()