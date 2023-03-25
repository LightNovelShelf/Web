let api = VUE_APP_API_SERVER

function getApiserver() {
  return `${api}/hub/api`
}

function getApiHost() {
  return api
}

function setApiServer(str: string) {
  api = str
}

export { getApiserver, getApiHost, setApiServer }
