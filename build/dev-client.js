/**
 * dev-client.js Created by xh on 2018-2-12
 */
var hotClient = require('webpack-hot-middleware/client?noInfo=true&reload=true')

hotClient.subscribe(event => {
    if(event.action === 'reload'){
        window.location.reload();
    }
})
 