"use strict";


//define routes (for url navigation)
var routes = [
    { path: '/:selector' }
]

// router instance
var router = new VueRouter({
    routes: routes
})

// Vue!
var app = new Vue({
    router: router,
    el: "#app",
    // vars
    data: {
        test: {
            requests: []
        },
        table: {},
        sorter: {
            column: 1,
            ascending: false
        },
        requests: [],
        duplicates: [],
        searchCategory: 'title',
        searchTerm: '',
        sortBy: 'request date',
        headerKeys: {
            'title': 'itemtitle',
            'request date': 'daterequested',
            'collection': 'collection_VSVal_',
            'staff requested': 'staffrequesting_VSVal_',
            'selector': 'selector'
        },
        book: {
            title: '',
            author: '',
            isbn: '',
            published: '',
            type: ''
        },
        status: {
            all: true,
            cancelled: false,
            hold: false,
            standing: false,
            tech: false,
            selected: false
        },
        isLoading: true,
        drawnOnce: false
    },

    computed: {
        isAdmin: function() {
            if(this.$route.path.length > 1) { 
                return false
            }
            return true
        },
        selector: function() {
            return this.$route.params.selector
        },
        filteredRequests: function() {
            // grab the search category
            var filter = this.headerKeys[this.searchCategory] //default val is this.headerKeys['title']

            // filter by the search term (if there is one)
            return this.requests.filter(function(request) {
                if (!this.searchTerm) return true
                if (request.hasOwnProperty(filter) && !!request[filter])
                    return request[filter].toLowerCase().indexOf(this.searchTerm.toLowerCase()) != -1
                else return false
            }.bind(this))

            // filter by the statuses if any are checked
            .filter(function(request) {
                var isCancelled = JSON.stringify(this.status.cancelled)
                var isHold = JSON.stringify(this.status.hold)
                var isStanding = JSON.stringify(this.status.standing)
                var isTech = JSON.stringify(this.status.tech)
                var isSelected = JSON.stringify(this.status.selected)
                if (this.status.all) {
                    return request.cancelled != 'true'
                }

                if (isTech=='true')
                    if (request.sendtech == isTech) return true
                if (isStanding=='true')
                    if (request.standorder == isStanding) return true
                if (isSelected=='true')
                    if (request.selected == isSelected) return true
                if (isHold=='true')
                    if (request.holdplaced == isHold) return true
                if (isCancelled=='true')
                    if (request.cancelled == isCancelled) return true
                return false
            }.bind(this))

            // filter by selector if present
            .filter(function(request) {
                if (!this.selector) return true
                if (!request.selector) return false
                return request.selector.replace(/ /g, '').toLowerCase() == this.selector.replace(/ /g, '').toLowerCase()
            }.bind(this))
        },

        datedHolds: function() {
            let lastWeek = new Date()
            lastWeek.setDate(lastWeek.getDate() - 7) //seven days ago
            
            let heldRequests = this.requests
                .filter(item => item.holdplaced == true || item.holdplaced == 'true')
           
            return heldRequests.filter(item => {
                item.formattedHoldDate = new Date(item.psofia_editeddate)
                return item.formattedHoldDate < lastWeek
            }) 
        }
    },
    watch: {
        // update the google table if the requests change
        filteredRequests: function() {
            // save the sort info after the initial render
            if (this.drawnOnce && this.table.getSortInfo().column != -1) {
                this.sorter = this.table.getSortInfo()
            }
            if (!this.isLoading) Vue.nextTick(this.formatDataForTable)
        }
    },

    // start here
    mounted: function() {
        // set up the book info modal
        $('#book-info-modal').modal({
            complete: this.clearBook // clear book info when closing
        })

        // fetch data when google is ready
        google.charts.load('current',{'packages':['table']})
        //@TODO: below needs to be commented out when if/when using livedata      
        //google.charts.setOnLoadCallback(this.fetchData)
        
            axios.post('http://ax1vnode1.cityoflewisville.com/v2/', {
                webservice: 'Library/Duplicate Requests'
            }).then(function(results) {
                this.storeDuplicates(results.data[0])
            }.bind(this))
    },

    created: function() {
     
    },

    // functions
    methods: {

        //fetch the requests
        // fetchData: function() {
        //     this.isLoading = true
        //     axios.post('http://ax1vnode1.cityoflewisville.com/v2/', {
        //         webservice: 'Library/MediaRequest'
        //     }).then(function(results) {
        //         this.storeRequests(results.data[0])
        //     }.bind(this))
        // },

        storeDuplicates: function(dupes){
            this.duplicates = dupes
        },
        // store the requests in vue data, done loading
        storeRequests: function(requests) {
            this.requests = requests
            this.isLoading = false
            Vue.nextTick(this.formatDataForTable)
            
            //remove elements from requests that have a hold and a lastedited date older than one week
            this.requests = this.requests.filter(element => {
                return !this.datedHolds.includes(element)   //this.datedHolds.indexOf(element) < 0
            })
        },

        // set up the data for google charts table
        formatDataForTable: function() {

            // headers
            var data = new google.visualization.DataTable()
            data.addColumn('string', '&nbsp;')
            data.addColumn('string', 'Date Requested')
            data.addColumn('string', 'Status')
            data.addColumn('string', 'Title')
            data.addColumn('string', 'Book Information')
            data.addColumn('string', 'Collection')
            data.addColumn('string', 'Selector')
            data.addColumn('string', 'Staff Requested')
            data.addColumn('string', 'Created By')
            // data.addColumn('string', 'Created Date')
            // data.addColumn('string', 'Edited By')
            // data.addColumn('string', 'Edited Date')
            data.addColumn('string', 'Patron Name')
            data.addColumn('string', 'Library Card Number')
            data.addColumn('string', 'Notes')

            // loop through requests, add them to each row
            this.filteredRequests.forEach(function(request) {
                // for status 'chips'
                var status = ''
                status += (request.cancelled == 'true') ? '<p class="chip red white-text">Cancelled</p>' : ''
                status += (request.holdplaced == 'true') ? '<p class="chip indigo white-text">On Hold</p>' : ''
                status += (request.sendtech == 'true') ? '<p class="chip blue white-text">Send to Tech</p>' : ''
                status += (request.standorder == 'true') ? '<p class="chip amber darken-2 white-text">Standing Order</p>' : ''
                status += (request.selected == 'true') ? '<p class="chip green white-text">Selected</p>' : ''

                // shortening dates (no timestamp)
                // var created = ''//(request.psofia_createddate) ? moment(request.psofia_createddate, 'YYYY-MM-DD hh:mm:ss').format('YYYY-MM-DD') : null
                // var edited = ''//(request.psofia_editeddate) ? moment(request.psofia_editeddate, 'YYYY-MM-DD hh:mm:ss').format('YYYY-MM-DD') : null

                // edit button
                var editor = ''
                editor += '<a target="_blank" href="http://apps.cityoflewisville.com/psofia/default.aspx?formnumber=66&record='
                editor += request.psofia_recordid.toLowerCase()
                editor += '"><i class="material-icons grey-text">edit</i></a>'

                // book info
                var info = ''
                info += '<a class="btn indigo lighten-2" onClick="app.openBookModal(\''
                info += request.psofia_recordid + '\')'
                info += '"><i class="material-icons white-text">book</i></a>'

                // piece it all together
                data.addRow([
                    editor,
                    request.daterequested, //new Date(moment(request.daterequested, 'YYYY-MM-DD').format('MM-DD-YYYY')),
                    status,
                    request.itemtitle,
                    info,
                    request.collection_VSVal_,
                    request.selector,
                    request.staffrequesting_VSVal_,
                    request.psofia_createdby.slice(0, request.psofia_createdby.indexOf('@cityoflewisville.com')),
                    // created, //new Date(moment(request.psofia_createddate, 'YYYY-MM-DD hh:mm:ss').format('MM-DD-YYYY hh:mm:ss')),
                    // request.psofia_editedby,
                    // edited, //new Date(moment(request.psofia_editeddate, 'YYYY-MM-DD hh:mm:ss').format('MM-DD-YYYY hh:mm:ss')),
                    request.patronname,
                    request.librarycardnumber,
                    request.notes
                ])
            })

            // table options
            var options = {
                allowHtml: true,
                alternatingRowStyle: true,
                cssClassNames: {
                    oddTableRow: 'odds',
                    hoverTableRow: 'hov'
                },
                sortColumn: this.sorter.column,
                sortAscending: this.sorter.ascending
            }


            // render
            this.table = new google.visualization.Table(document.getElementById('table-container'))
            this.table.draw(data, options)
            this.drawnOnce = true
        },

        // get request by id number
        getRequest: function(id) {
            for (var i=0; i<this.filteredRequests.length; i++) {
                if (this.filteredRequests[i].psofia_recordid == id) return this.filteredRequests[i]
            }
            return null
        },

        // open book info modal
        openBookModal: function(id) {
            var request = this.getRequest(id)
            if (!request) alert('No book information found for this request.')

            // set book info
            this.book.title = request.itemtitle
            this.book.author = request.author
            this.book.isbn = request.isbn
            this.book.published = request.pubdate
            this.book.type = request.mediatype_VSVal_

            // open
            $('#book-info-modal').modal('open')
        },

        // clear book info
        clearBook: function() {
            console.log('clearBook')
            this.book.title = ''
            this.book.author = ''
            this.book.isbn = ''
            this.book.published = ''
            this.book.type = ''
        },

        setHeldItems: function() {
             //clear holds older than one (1) week
    
           this.heldItems = this.requests
           .filter(item => {
               return item.holdplaced == true || item.holdplaced == 'true'
           })
                        
      
        }
    }
})
//@TODO: swap out axios.post with below for hot reload on request data
 var myData = new LiveData({ webservice: 'Library/MediaRequest' });

myData.on('initial data received', function(args){
    var initialData = args['initialData'];
    app._data.test.requests = initialData;
    app._data.isLoading = false;
    app._data.requests = initialData[0];
    setTimeout(app.formatDataForTable, 5)
    app.storeRequests(app._data.requests)
})

// setInterval(function() {
//     console.log(`interval running again`)
//     myData.refreshData()
//     },  20000)