/**
 * Created by miuan on 6/12/14.
 */
module.exports = (function(){
"use strict"
    var self = {};

    /** optional global seting
     * self.$init = {
     *      return {
     *              // potentional config
     *      }
     * }
     */

    /** option setting just for function
     * self.index_get_setting = {
     *      // potentional setting
     * }
     */

    /** option input parrams
     * self.index_get_params: {
     * }
     */

    self.index_get = function(request, reply){

        reply.view('index');
    }


    return self;
})();