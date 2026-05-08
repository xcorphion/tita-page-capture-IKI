import { connectToDatabase } from '@xcorphion/shared';
import { checkAdminAuth } from '../../../lib/adminAuth';
import { randomUUID } from 'crypto';

function sanitizeHtml(html) {
    if (typeof html !== 'string') return '';
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
        .replace(/<(object|embed|link|meta|base)[^>]*\/?>/gi, '')
        .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/href\s*=\s*["']\s*javascript:[^"']*/gi, 'href="#"');
}

export default async function handler(req, res) {
    const db = await connectToDatabase('platform');
    const collection = db.collection('break_news_articles');

    // MÉTODOS PERMITIDOS: GET e POST
    if (req.method === 'GET') {
        try {
            // Retorna apenas dados essenciais para o carrossel para otimizar payload (OWASP API3:2023 - Broken Object Property Level Authorization)
            const articles = await collection.find({})
                .project({ article_content: 0 }) // Não envia o corpo do artigo na listagem
                .sort({ published_at: -1 })
                .toArray();
            return res.status(200).json({ success: true, data: articles });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, error: 'Database error' });
        }
    }

    if (req.method === 'POST') {
        if (!checkAdminAuth(req, res)) return;
        try {
            const body = req.body;
            
            // Validação estrita de entrada (OWASP API8:2023 - Security Misconfiguration / Injection)
            if (!body || typeof body !== 'object') {
                return res.status(400).json({ success: false, error: 'Invalid payload' });
            }

            const { card_title, card_legend, card_image, article_content, author, sources, customId } = body;

            if (!card_title || typeof card_title !== 'string' || card_title.trim().length === 0) {
                return res.status(400).json({ success: false, error: 'Title is required and must be a string' });
            }

            // Sanitização básica implícita via estruturação explícita (Evita Mass Assignment - OWASP API6)
            const newArticle = {
                custom_id: customId || randomUUID(),
                card_title: card_title.trim(),
                card_legend: typeof card_legend === 'string' ? card_legend.trim() : '',
                card_image: typeof card_image === 'string' ? card_image.trim() : '',
                article_content: sanitizeHtml(article_content),
                author: typeof author === 'string' ? author.trim() : 'Admin',
                sources: Array.isArray(sources) ? sources.filter(s => typeof s === 'string') : [],
                published_at: new Date()
            };

            await collection.insertOne(newArticle);
            return res.status(201).json({ success: true, data: newArticle });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, error: 'Database error' });
        }
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
