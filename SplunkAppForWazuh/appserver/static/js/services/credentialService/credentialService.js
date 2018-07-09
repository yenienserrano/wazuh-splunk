define(['../module', 'splunkjs/mvc'], function (module, mvc) {
  'use strict';
  module.service('$credentialService', function ($http) {
    const service = mvc.createService({ owner: "nobody" })

    /**
     * GET method
     * @param {String} url 
     */
    const get = (url) => {
      return new Promise((resolve, reject) => {
        service.request(url, "GET", null, null, null, { "Content-Type": "application/json" }, (err, data) => {
          if (err)
            return reject(err)
          resolve(data.data)
        })
      })
    }
    /**
     * POST method
     * @param {String} url 
     * @param {Object} record 
     */
    const post = (url, record) => {
      return new Promise((resolve, reject) => {
        service.request(url, "POST", null, null, JSON.stringify(record), { "Content-Type": "application/json" }, (err, data) => {
          if (err)
            return reject(err)
          return resolve(data)
        })
      })
    }

    /**
     * DELETE method
     * @param {String} url 
     */
    const deletes = (url) => {
      if (!url || url === '') {
        url = "storage/collections/data/credentials/"
      }
      return new Promise((resolve, reject) => {
        service.del(url, {}, (err, data) => {
          if (err) {
            return reject(err)
          }
          return resolve(data)
        })
      })
    }

    /**
     * Update a record
     * @param {String} key 
     */
    const update = async (key, newRegister) => {
      try {
        await post("storage/collections/data/credentials/" + key, newRegister)
        return
      } catch (err) {
        return Promise.reject(err)
      }
    }

    // -------- CRUD METHODS ------------ //

    /**
     * Returns the already selected API from sessionStorage
     */
    const getSelectedApi = () => {
      return sessionStorage.selectedApi
    }

    /**
     * Delete a record by ID
     * @param {String} key 
     */
    const remove = async (key) => {
      try {
        const api = await select(key)
        if (sessionStorage.selectedApi && JSON.parse(sessionStorage.selectedApi) && JSON.parse(sessionStorage.selectedApi).url === api.url) {
          sessionStorage.selectedApi = ''
        }
        await delete ("storage/collections/data/credentials/" + key)
        return
      } catch (err) {
        return Promise.reject(err)
      }
    }

    /**
     * Select an API by ID
     * @param {String} key 
     */
    const select = async (key) => {
      try {
        const manager = await get("storage/collections/data/credentials/" + key)
        return manager
      } catch (err) {
        return Promise.reject(err)
      }
    }

    /**
     * Select an API as the default one, 'selected' field to true by ID
     * @param {String} key 
     */
    const chose = async (key) => {
      try {
        const apiList = await getApiList()
        for (let api of apiList) {
          if (api._key === key) {
            sessionStorage.selectedApi = ''
            sessionStorage.selectedApi = JSON.stringify(api)
          }
        }
        return
      } catch (err) {
        return Promise.reject(err)
      }
    }

    /**
     * Deselect all stored APIs. 'selected' field to false.
     * @param {String} key 
     */
    const deselectAllApis = () => {
      try {
        sessionStorage.selectedApi = ''
        return
      } catch (err) {
        return Promise.reject(err)
      }
    }

    /**
     * Insert a new record in the KVstore DB
     * @param {Object} record 
     */
    const insert = async (record) => {
      try {
        const result = await post("storage/collections/data/credentials/", record)
        return result
      } catch (err) {
        return Promise.reject(err)
      }
    }

    /**
     * Returns the API list
     */
    const getApiList = async () => {
      try {
        const apiList = await get("storage/collections/data/credentials/")
        const selectedApi = sessionStorage.selectedApi
        for (let i = 0; i < apiList.length; i++) {
          if (typeof selectedApi === 'string' && JSON.parse(selectedApi).url && apiList[i].url === JSON.parse(selectedApi).url) {
            apiList[i].selected = true
          }
        }
        return apiList
      } catch (err) {
        return Promise.reject(err)
      }
    }

    /**
     * Check if connection with selected API was successful
     * @param {Object} apiList 
     */
    const checkSelectedApiConnection = async () => {
      try {
        const currentApi = sessionStorage.selectedApi
        if (!currentApi) { return Promise.reject(new Error('No selected API in sessionStorage')) }
        const api = await checkApiConnection(JSON.parse(currentApi)._key)
        let selectedIndex = IndexService.get()
        if (!selectedIndex || selectedIndex === '') {
          selectedIndex = 'wazuh'
        }
        return { api, selectedIndex }
      } catch (err) {

        return Promise.reject(err)
      }
    }

    /**
    * Check the current state of agents status history
    */
    const checkPollingState = async () => {
      const getPollingState = '/manager/polling_state/'
      const pollingStatus = await ApiService.get(getPollingState)
      return (pollingStatus.disabled === "true") ? false : true
    }

    /**
     * Check if connection with API was successful, also returns the whole needed information about it
     * @param {String} key 
     */
    const checkApiConnection = async (key) => {
      try {
        const api = await select(key)
        const checkConnectionEndpoint = '/manager/check_connection?ip=' + api.url + '&port=' + api.portapi + '&user=' + api.userapi + '&pass=' + api.passapi
        const getClusterNameEndpoint = '/cluster/node?ip=' + api.url + '&port=' + api.portapi + '&user=' + api.userapi + '&pass=' + api.passapi
        const getManagerNameEndpoint = '/agents/agent/?id=000&ip=' + api.url + '&port=' + api.portapi + '&user=' + api.userapi + '&pass=' + api.passapi

        const clusterData = await ApiService.get(checkConnectionEndpoint)
        api.filter = []
        // Get manager name. Necessary for both cases
        const managerName = await ApiService.get(getManagerNameEndpoint)

        if (managerName && managerName.data && managerName.data.length > 0 && managerName.data[0].name) {
          if (!api.managerName || api.managerName !== managerName.data[0].name) {
            api.managerName = managerName.data[0].name
            await update(api._key, api)
          }
        }

        // If cluster is disabled, then filter by manager.name
        if (clusterData.data.enabled === "yes") {
          api.filter.push('cluster.name')
          const clusterName = await ApiService.get(getClusterNameEndpoint)
          api.filter.push(clusterName.cluster)
          if (!api.cluster || api.cluster !== clusterName.cluster) {
            api.cluster = clusterName.cluster
            await update(api._key, api)
          }
        } else {
          if (api.cluster) {
            api.cluster = false
            await update(api._key, api)
          }
          api.filter.push('manager.name')
          api.filter.push(api.managerName)
        }
        return api
      } catch (err) {
        return Promise.reject(err)
      }
    }

    const methods = {
      get: get,
      post: post,
      delete: deletes,
      checkApiConnection: checkApiConnection,
      checkPollingState: checkPollingState,
      checkSelectedApiConnection: checkSelectedApiConnection,
      getApiList: getApiList,
      insert: insert,
      deselectAllApis: deselectAllApis,
      chose: chose,
      select: select,
      remove: remove,
      update: update,
      getSelectedApi: getSelectedApi
    }
    return methods;
  })
})