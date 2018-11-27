define(['../module'], function(module) {
  'use strict'

  module.config([
    '$stateProvider',
    'BASE_URL',
    function($stateProvider, BASE_URL) {
      $stateProvider

        // Manager
        .state('manager', {
          templateUrl:
            BASE_URL +
            'static/app/SplunkAppForWazuh/js/controllers/management/welcome/manager-welcome.html'
        })
        // Manager - Monitoring
        .state('mg-monitoring', {
          templateUrl:
            BASE_URL +
            'static/app/SplunkAppForWazuh/js/controllers/management/monitoring/monitoring.html',
          onEnter: $navigationService => {
            $navigationService.storeRoute('mg-monitoring')
          },
          controller: 'monitoringCtrl',
          params: { id: null, filters: null },
          resolve: {
            monitoringInfo: [
              '$requestService',
              '$stateParams',
              ($requestService, $stateParams) => {
                return Promise.all([
                  $requestService.apiReq('/cluster/status'),
                  $requestService.apiReq('/cluster/nodes'),
                  $requestService.apiReq('/cluster/config'),
                  $requestService.apiReq('/version'),
                  $requestService.apiReq('/agents', { limit: 1 }),
                  $requestService.apiReq('/cluster/healthcheck')
                ])
                  .then(
                    function(response) {
                      return response
                    },
                    function(response) {
                      return response
                    }
                  )
                  .catch(err => {
                    console.error('Error route: ', err)
                  })
              }
            ]
          }
        })
        // Manager - rules
        .state('mg-logs', {
          templateUrl:
            BASE_URL +
            'static/app/SplunkAppForWazuh/js/controllers/management/logs/manager-logs.html',
          onEnter: $navigationService => {
            $navigationService.storeRoute('mg-logs')
          },
          controller: 'managerLogsCtrl',
          resolve: {
            logs: [
              '$requestService',
              $requestService => {
                return $requestService
                  .apiReq('/manager/logs/summary')
                  .then(
                    response => {
                      return response
                    },
                    response => {
                      return response
                    }
                  )
                  .catch(err => console.error('settings.api'))
              }
            ]
          }
        })
        // Manager - Ruleset
        .state('mg-rules', {
          templateUrl:
            BASE_URL +
            'static/app/SplunkAppForWazuh/js/controllers/management/rules/manager-ruleset.html',
          onEnter: $navigationService => {
            $navigationService.storeRoute('mg-rules')
          },
          controller: 'managerRulesetCtrl',
          params: { filters: null }
        })
        // Manager - Ruleset/:id
        .state('mg-rules-id', {
          templateUrl:
            BASE_URL +
            'static/app/SplunkAppForWazuh/js/controllers/management/rules/manager-ruleset-id.html',
          onEnter: $navigationService => {
            $navigationService.storeRoute('mg-rules')
          },
          controller: 'managerRulesetIdCtrl',
          params: { id: null, filters: null },
          resolve: {
            ruleInfo: [
              '$requestService',
              '$stateParams',
              ($requestService, $stateParams) => {
                return $requestService
                  .apiReq(`/rules/${$stateParams.id}`)
                  .then(
                    function(response) {
                      return response
                    },
                    function(response) {
                      return response
                    }
                  )
                  .catch(err => {
                    console.error('Error route: ', err)
                  })
              }
            ]
          }
        })
        // Manager - Decoders
        .state('mg-decoders', {
          templateUrl:
            BASE_URL +
            'static/app/SplunkAppForWazuh/js/controllers/management/decoders/manager-decoders.html',
          onEnter: $navigationService => {
            $navigationService.storeRoute('mg-decoders')
          },
          controller: 'managerDecodersCtrl',
          params: { filters: null }
        })

        // Manager - Decoders/:id
        .state('mg-decoders-id', {
          templateUrl:
            BASE_URL +
            'static/app/SplunkAppForWazuh/js/controllers/management/decoders/manager-decoders-id.html',
          onEnter: $navigationService => {
            $navigationService.storeRoute('mg-decoders')
          },
          controller: 'managerDecodersIdCtrl',
          params: { id: null, name: null },
          resolve: {
            currentDecoder: [
              '$requestService',
              '$stateParams',
              ($requestService, $stateParams) => {
                return $requestService
                  .apiReq(`/decoders/${$stateParams.name}`)
                  .then(
                    function(response) {
                      return response
                    },
                    function(response) {
                      return response
                    }
                  )
                  .catch(err => {
                    console.error('Error route: ', err)
                  })
              }
            ]
          }
        })

        // Manager - Groups
        .state('mg-groups', {
          templateUrl:
            BASE_URL +
            'static/app/SplunkAppForWazuh/js/controllers/management/groups/groups.html',
          onEnter: $navigationService => {
            $navigationService.storeRoute('mg-groups')
          },
          controller: 'groupsCtrl',
          params: { group: null }
        })

        // Manager - Groups
        .state('mg-conf', {
          templateUrl:
            BASE_URL +
            'static/app/SplunkAppForWazuh/js/controllers/management/configuration/both-configuration.html',
          onEnter: $navigationService => {
            $navigationService.storeRoute('mg-conf')
          },
          controller: 'configurationCtrl'
        })

        // Manager - Status
        .state('mg-status', {
          templateUrl:
            BASE_URL +
            'static/app/SplunkAppForWazuh/js/controllers/management/status/status.html',
          onEnter: $navigationService => {
            $navigationService.storeRoute('mg-status')
          },
          controller: 'statusCtrl',
          resolve: {
            statusData: [
              '$requestService',
              '$state',
              async ($requestService, $state) => {
                try {
                  const responseStatus = await $requestService.apiReq(
                    '/cluster/status'
                  )
                  let promises = []
                  if (
                    !responseStatus ||
                    !responseStatus.data ||
                    !responseStatus.data.error
                  ) {
                    const nodes = await $requestService.apiReq('/cluster/nodes')
                    if (
                      responseStatus.data.data &&
                      responseStatus.data.data.enabled === 'yes' &&
                      responseStatus.data.data.running === 'yes'
                    ) {
                      const masterNode = nodes.data.data.items.filter(
                        item => item.type === 'master'
                      )[0]
                      promises = [
                        $requestService.apiReq('/agents/summary'),
                        $requestService.apiReq(
                          `/cluster/${masterNode.name}/status`
                        ),
                        $requestService.apiReq(
                          `/cluster/${masterNode.name}/info`
                        ),
                        $requestService.apiReq('/rules', {
                          offset: 0,
                          limit: 1
                        }),
                        $requestService.apiReq('/decoders', {
                          offset: 0,
                          limit: 1
                        }),
                        Promise.resolve(masterNode),
                        Promise.resolve(nodes),
                        Promise.resolve(responseStatus.data)
                      ]
                    } else if (
                      responseStatus.data.data.enabled === 'yes' &&
                      responseStatus.data.data.running === 'no'
                    ) {
                      promises = [
                        $requestService.apiReq('/agents/summary'),
                        Promise.resolve(false),
                        Promise.resolve(false),
                        $requestService.apiReq('/rules', {
                          offset: 0,
                          limit: 1
                        }),
                        $requestService.apiReq('/decoders', {
                          offset: 0,
                          limit: 1
                        }),
                        Promise.resolve(false),
                        Promise.resolve(nodes),
                        Promise.resolve(responseStatus.data)
                      ]
                    } else {
                      promises = [
                        $requestService.apiReq('/agents/summary'),
                        $requestService.apiReq(`/manager/status`),
                        $requestService.apiReq(`/manager/info`),
                        $requestService.apiReq('/rules', {
                          offset: 0,
                          limit: 1
                        }),
                        $requestService.apiReq('/decoders', {
                          offset: 0,
                          limit: 1
                        }),
                        Promise.resolve(false)
                      ]
                    }
                  } else {
                    promises = [
                      $requestService.apiReq('/agents/summary'),
                      $requestService.apiReq(`/manager/status`),
                      $requestService.apiReq(`/manager/info`),
                      $requestService.apiReq('/rules', { offset: 0, limit: 1 }),
                      $requestService.apiReq('/decoders', {
                        offset: 0,
                        limit: 1
                      }),
                      Promise.resolve(false)
                    ]
                  }
                  return await Promise.all(promises)
                } catch (err) {
                  $state.go('settings.api')
                }
              }
            ],
            agentInfo: [
              '$requestService',
              '$state',
              async ($requestService, $state) => {
                try {
                  const response = await $requestService.apiReq('/agents', {
                    limit: 1,
                    sort: '-dateAdd'
                  })

                  const lastAgent = await $requestService.apiReq(
                    `/agents/${response.data.data.items[0].id}`,
                    {}
                  )
                  return lastAgent
                } catch (err) {
                  $state.go('settings.api')
                }
              }
            ]
          }
        })
    }
  ])
})