const groups = db.participants.aggregate([
  { $match: { status: 'ATIVO' } },
  { $group: {
    _id: { $toLower: '$participant_name' },
    count: { $sum: 1 },
    docs: { $push: {
      _id: '$_id',
      sessions_completed: { $ifNull: ['$sessions_completed', 0] },
      respondent_number: '$respondent_number'
    }}
  }},
  { $match: { count: { $gt: 1 } } }
]).toArray();

let total = 0;

for (const group of groups) {
  const sorted = group.docs.sort((a, b) => {
    const diff = (b.sessions_completed || 0) - (a.sessions_completed || 0);
    return diff !== 0 ? diff : (a.respondent_number || 0) - (b.respondent_number || 0);
  });

  const toInactivate = sorted.slice(1).map(d => d._id);

  if (toInactivate.length) {
    db.participants.updateMany(
      { _id: { $in: toInactivate } },
      { $set: { status: 'INATIVO' } }
    );
    total += toInactivate.length;
    print('"' + group._id + '" — manteve 1, inativou ' + toInactivate.length);
  }
}

print('\nTotal inativados: ' + total);
