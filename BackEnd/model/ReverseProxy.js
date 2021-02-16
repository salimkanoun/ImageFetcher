const { OTJSForbiddenException } = require('../Exceptions/OTJSErrors')
const Options = require('./Options')
const got = require('got')

const ReverseProxy = {

  getOrthancAddress () {
    const orthancSettings = Options.getOrthancConnexionSettings()
    this.address = orthancSettings.OrthancAddress
    this.port = orthancSettings.OrthancPort
    this.username = orthancSettings.OrthancUsername
    this.password = orthancSettings.OrthancPassword
    return this.address + ':' + this.port
  },

  makeOptions (method, api, data) {
    const serverString = this.getOrthancAddress() + api

    let options = null

    if (method === 'GET' || method === 'DELETE') {
      options = {
        method: method,
        url: serverString,
        headers: {
          'Forwarded' : 'by=localhost;for=localhost;host='+process.env.DOMAIN_ADDRESS+'/api;proto='+process.env.DOMAIN_PROTOCOL
        },
        auth: `${this.username}:${this.password}`
      }
    } else {
      options = {
        method: method,
        url: serverString,
        auth: `${this.username}:${this.password}`,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': JSON.stringify(data).length
        },
        body: JSON.stringify(data)
      }
    }

    return options
  },

  makeOptionsUpload (method, api, data, plain=false) {
    const serverString = this.getOrthancAddress() + api

    const options = {
      method: method,
      url: serverString,
      auth: `${this.username}:${this.password}`,
      headers: {
        'Content-Type': plain ? 'application/dicom' : 'text/plain',
        'Content-Length': data.length
      },
      body: data
    }

    return options
  },

  makeOptionsDownload (method, api, data) {
    const serverString = this.getOrthancAddress() + api

    const options = {
      method: method,
      url: serverString,
      auth: `${this.username}:${this.password}`,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Accept' : 'application/dicom'
      },
      body: JSON.stringify(data)
    }

    return options
  },

  streamToRes (api, method, data, res) {
    return got(this.makeOptions(method, api, data))
      .on('response', function (response) {
        if (response.statusCode === 200) {
          response.pipe(res)
        } 
        else if (response.statusCode === 401){
          res.status(403).send("Bad orthanc credentials")
        }
        else {
          res.status(response.statusCode).send(response.statusMessage)
        }
      }).catch((error) => {
        throw new OTJSInternalServerError(error);
      })
  },

  streamToResPlainText(api, method, data, res){
    return got(this.makeOptionsUpload(method, api, data, true))
      .on('response', function (response) {
        if (response.statusCode === 200) {
          response.pipe(res)
        }
        else if (response.statusCode === 401){
          res.status(403).send("Bad orthanc credentials")
        }
        else {
          res.status(response.statusCode).send(response.statusMessage)
        }
      }).catch((error) => {
        throw new OTJSInternalServerError(error);
      })
  },

  streamToResUploadDicom (api, method, data, res) {
    return got(this.makeOptionsUpload(method, api, data))
      .on('response', function (response) {
        if(response.statusCode == 200)
          response.pipe(res)
      }).catch((error) => {
        if (error.statusCode === 401) {
          res.status(403).send("Bad orthanc credentials")
        }else{
          res.status(error.statusCode).send(error)
        }
      })
  },

  streamToFile (api, method, data, streamWriter) {
    return got(this.makeOptions(method, api, data))
      .on('response', function (response) {
        if (response.statusCode === 200) {
          response.pipe(streamWriter)
            .on('finish', function () { console.log('Writing Done') })
        }
      }).catch((error) => {
        throw new OTJSInternalServerError(error);
      })
  },

  streamToFileWithCallBack (api, method, data, streamWriter, finishCallBack) {
    return got(this.makeOptionsDownload(method, api, data))
      .on('response', function (response) {
        if (response.statusCode === 200) {
          response.pipe(streamWriter)
            .on('finish', ()=>{
              finishCallBack()
            } )
        }
      }).catch((error) => {
        throw new OTJSInternalServerError(error);
      })
  },

  async getAnswer (api, method, data) {
    const requestPromise = got(this.makeOptions(method, api, data)).then(function (body) {
      return JSON.parse(body)
    }).catch((error) => { return false })

    return await requestPromise
  },

  async getAnswerPlainText (api, method, data) {
    const requestPromise = got(this.makeOptions(method, api, data)).then(function (body) {
      return body
    }).catch((error) => { return false })

    return await requestPromise
  }

}

module.exports = ReverseProxy
