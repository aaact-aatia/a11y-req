/*
Reformat clause array into nested dict (nested clauses in parents)

example_tree = {
  '5': {
    clause: { number: '5' },
    'children': {
      '5.1': {
        clause: { number: '5.1' },
        'children': {
          '5.1.1': {
            clause: { number: '5.1.1' },
            children: {}
          }
        }
      }
    }
  }
}
*/

module.exports = (clauses) => {

  clauses = clauses.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
  let clauseTree = {};

  for (clause of clauses) {
    let ancestry = clause.number.split(".");
    let ancestors = [];

    while (ancestry.length > 0) {
      ancestors.push(ancestry.join('.'));
      ancestry.pop();
    }

    ancestors.reverse();
    let treeIndex = '["' + ancestors.join('"]["children"]["') + '"]';
    let eString = `clauseTree` + treeIndex + ` = {
      'clause': clause,
      'children': {}
    }`;
    eval(eString);
  }

  // Convert children objects to sorted arrays
  // No need for keys as they are duplicated in clause.number
  const sortChildren = (tree) => {
    // Base case
    if (Object.keys(tree).length === 0 && tree.constructor === Object) {
      return [];
    }
    // Convert top level of tree to array and sort
    tree = Object.values(tree);
    tree.sort((a, b) => a.clause.number.localeCompare(b.clause.number, undefined, { numeric: true }));
    // Recurse on children of top level nodes
    for (node of tree) {
      node.children = sortChildren(node.children);
    }
    return tree;
  }

  return sortChildren(clauseTree);
};