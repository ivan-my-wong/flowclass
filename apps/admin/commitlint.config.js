// 0-disable 1-warn 2-error
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // new feature
        'upd', // update existing feature
        'fix', // bugfix
        'refactor', // code refactoring
        'docs', // documentation
        'chore', // for build / pipelone
        'style', // coding style
        'revert', // for revert commit
        'remove', // for removing feature or library
      ],
    ],
  },
}
