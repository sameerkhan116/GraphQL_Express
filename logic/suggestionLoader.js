import _ from 'lodash';

const batchSuggestions = async(keys, {Suggestion}) => {
  const suggestions = await Suggestion.findAll({
    raw: true,
    where: {
      boardId: {
        $in: keys
      }
    }
  });
  const gs = _.groupBy(suggestions, 'boardId');
  return keys.map(k => gs[k] || []);
}

export default batchSuggestions;