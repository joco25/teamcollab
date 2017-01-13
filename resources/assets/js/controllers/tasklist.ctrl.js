'use strict'
module.exports = [
  '$http', '$rootScope', 'TagDataService', function($http, $rootScope, TagData) {
    var _hasFilteredTags, _hasFilteredUsers, init
    this.newCard = {}
    this.users = []
    this.orderBy = 'name'
    this.filters = {
      users: [],
      tags: [],
      projects: []
    }
    init = (function(_this) {
      return function() {
        _this.loadProjects()
        _this.loadTeamUsers()
        return _this.loadTags()
      }
    })(this)
    $rootScope.$on('card:deleted', (function(_this) {
      return function() {
        return _this.loadProjects()
      }
    })(this))
    $rootScope.$on('projects:reload', (function(_this) {
      return function() {
        return _this.loadProjects()
      }
    })(this))
    this.createProject = function() {
      var projectName
      projectName = prompt("New Project Name")
      if (!projectName) {
        return
      }
      return $http.post('/api/projects', {
        name: projectName,
        stages: [
          {
            name: 'Open'
          }, {
            name: 'In Progress'
          }, {
            name: 'Closed'
          }
        ]
      }).success((function(_this) {
        return function(data) {
          return _this.projects = data.projects
        }
      })(this))
    }
    this.toggleFilter = (function(_this) {
      return function(filterName, obj) {
        _this.filters[filterName] = _this.filters[filterName] || []
        if (_.find(_this.filters[filterName], {
          id: obj.id
        })) {
          _.remove(_this.filters[filterName], obj)
        } else {
          _this.filters[filterName].push(obj)
        }
        return _this.createCardList()
      }
    })(this)
    this.isFilterObjActive = (function(_this) {
      return function(filterName, obj) {
        return _.find(_this.filters[filterName], obj)
      }
    })(this)
    this.clearFilters = (function(_this) {
      return function(filterName) {
        _this.filters[filterName] = []
        return _this.createCardList()
      }
    })(this)
    this.loadProjects = function() {
      return $http.get('/api/projects').success((function(_this) {
        return function(data) {
          _this.projects = data.projects
          return _this.createCardList()
        }
      })(this))
    }
    this.loadTags = function() {
      return TagData.loadTags().success((function(_this) {
        return function(data) {
          return _this.tags = data.tags
        }
      })(this))
    }
    this.loadTeamUsers = function() {
      return $http.get('/api/users').success((function(_this) {
        return function(data) {
          return _this.users = data.users
        }
      })(this))
    }
    this.createCard = (function(_this) {
      return function() {
        return $http.post('/api/cards/withoutStage', _this.newCard).success(function(data) {
          _this.projects = data.projects
          _this.createCardList()
          return _this.newCard.name = ''
        })
      }
    })(this)
    this.createCardList = (function(_this) {
      return function() {
        _this.cards = []
        return _.each(_this.projects, function(project) {
          return _.each(project.stages, function(stage) {
            if (_this.filters.projects.length > 0 && _.findIndex(_this.filters.projects, {
              id: stage.project_id
            }) === -1) {
              return
            }
            return _.each(stage.cards, function(card) {
              if (_this.filters.users.length > 0 && !_hasFilteredUsers(card)) {
                return
              }
              if (_this.filters.tags.length > 0 && !_hasFilteredTags(card)) {
                return
              }
              return _this.cards.push(card)
            })
          })
        })
      }
    })(this)
    _hasFilteredTags = (function(_this) {
      return function(card) {
        var found
        found = false
        _.each(_this.filters.tags, function(tag) {
          if (_.findIndex(card.tags, {
            id: tag.id
          }) > -1) {
            return found = true
          }
        })
        return found
      }
    })(this)
    _hasFilteredUsers = (function(_this) {
      return function(card) {
        var found
        found = false
        _.each(_this.filters.users, function(user) {
          if (_.findIndex(card.users, {
            id: user.id
          }) > -1) {
            return found = true
          }
        })
        return found
      }
    })(this)
    init()
  }
]

// ---
// generated by coffee-script 1.9.2