import _ from 'lodash';

/* 
  Helper function for the data loader we pass in the context when using graphqlExpress.
  We get the keys and the db where we will be looking for them and search in the db.
  suggestions is the collection of all suggestion components of which boardId also present in keys.
  We then use lodash lib to group these values according to their boardids.
  we then return these values by mapping the provided keys for each of the grouped data that we got.
*/

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