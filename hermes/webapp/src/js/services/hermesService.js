(function() {

    'use strict';

    function HermesService($http, $q) {
        var fates;
        var service = {
            getFates: getFates,
            getFatesSigma: getFatesSigma,
            getOpenLabors: getOpenLabors,
            getOpenQuests: getOpenQuests,
            getQuestDetails: getQuestDetails,
            getOwnerInformation: getOwnerInformation,
            getHostTags: getHostTags,
            getCurrentUser: getCurrentUser,
            getStartingEventTypes: getStartingEventTypes,
            getUserThrowableEventTypes: getUserThrowableEventTypes,
            getQuestCreatorThrowableEventTypes: getQuestCreatorThrowableEventTypes,
            runQuery: runQuery,
            createQuest: createQuest,
            createEvents: createEvents
        };

        return service;

        /////////////////////////

        /**
         * Try to create a quest given the information
         * @param user the user who is the owner/creator of the quest
         * @param hosts the list of hosts to which this quest applies
         * @param eventType the starting event-type
         * @param description the human readable description for this quest
         */
        function createQuest(user, hosts, eventType, description) {
            return $http.post("/api/v1/quests", {
                'creator': user,
                'hostnames': hosts,
                'eventTypeId': eventType.id,
                'description': description
            }).then(createQuestCompleted)
                .catch(createQuestFailed);

            function createQuestCompleted(response) {
                return response;
            }

            function createQuestFailed(error) {
                console.error("API for creating a quest failed! " + error.status + " " + error.statusText);
                throw error;
            }
        }

        /**
         * Try to create events for the given hsots
         * @param user the authenticated user creating these events
         * @param hosts the list of hosts we want to create these events for
         * @param eventType the eventtype of the event to create
         * @param note the note to put with the event
         */
        function createEvents(user, hosts, eventType, note) {
            return $http.post("/api/v1/events", {
                'user': user,
                'hostnames': hosts,
                'eventTypeId': eventType.id,
                'note': note
            }).then(createQuestCompleted)
                .catch(createQuestFailed);

            function createQuestCompleted(response) {
                return response;
            }

            function createQuestFailed(error) {
                console.error("API for creating a quest failed! " + error.status + " " + error.statusText);
                throw error;
            }
        }


        /**
         * Get the current authenticated user
         */
        function getCurrentUser() {
            return $http.get("/api/v1/currentUser")
                .then(getCurrentUserComplete)
                .catch(getCurrentUserFailed);

            function getCurrentUserComplete(response) {
                if (response.data['user']) {
                    return response.data['user'];
                } else {
                    return null;
                }
            }

            function getCurrentUserFailed(error) {
                console.error("API call to get open current user. " + error.status + " " + error.statusText);
            }
        }

        /**
         * Get a list of all open labors, along with quest details
         */
        function getOpenLabors(options) {
            var url = "/api/v1/labors/?open=true&expand=hosts&limit=all&expand=quests&expand=events&expand=eventtypes";

            if (options['filterByOwner']) {
                url += "&userQuery=" + options['filterByOwner'];
            }

            return $http.get(url)
                .then(getLaborsComplete)
                .catch(getLaborsFailed);

            function getLaborsComplete(response) {
                return response.data;
            }

            function getLaborsFailed(error) {
                console.error("API call to get open labors failed. " + error.status + " " + error.statusText);
                throw error;
            }
        }

        /**
         * Get a list of all the open quests but not all the details --
         * just enough to give overview information.
         * @returns {*}
         */
        function getOpenQuests(options) {

            var url = "/api/v1/quests?filterClosed=true&progressInfo=true&expand=hosts&expand=labors&limit=all";

            if (options['filterByCreator']) {
                url += "&byCreator=" + options['filterByCreator'];
            }
            return $http.get(url)
                .then(getQuestsComplete)
                .catch(getQuestsFailed);

            function getQuestsComplete(response) {
                return response.data;
            }

            function getQuestsFailed(error) {
                console.error("API call to get open Quests failed. " + error.status + " " + error.statusText);
                throw error;
            }
        }

        /**
         * Grab all the details for a given quest (labors, events and eventtypes)
         * @param id the id of the quest we care about
         */
        function getQuestDetails(id) {
            return $http.get("/api/v1/quests/" + id + "/?progressInfo=true&limit=all&expand=labors&expand=hosts&expand=events&expand=eventtypes")
                .then(getQuestComplete)
                .catch(getQuestFailed);

            function getQuestComplete(response) {
                return response.data;
            }

            function getQuestFailed(error) {
                console.error("API call to get details of Quest " + id + " failed: "  + error.status + " " + error.statusText);
            }
        }

        /**
         * Get the owner information for the hosts we care about
         * @param hostnames the hostnames of the hosts we care about
         * @returns {*}
         */
        function getOwnerInformation(hostnames) {
            return $http.post("/api/v1/extquery", {"hostnames": hostnames})
                .then(getOwnersComplete)
                .catch(getOwnersFailed);

            function getOwnersComplete(response) {
                return response.data.results;
            }

            function getOwnersFailed(error) {
                console.error("API to get owners failed: " + error.status + " " + error.statusText);
            }
        }

        /**
         * Get tags for each of the hosts
         * @param hostnames the hostnames of the hosts we care about
         * @returns {*}
         */
        function getHostTags(hostnames) {
            return $http.post("/api/v1/extquery", {"hostnames": hostnames, "operation": "tags"})
                .then(getTagsComplete)
                .catch(getTagsFailed);

            function getTagsComplete(response) {
                return response.data.results;
            }

            function getTagsFailed(error) {
                console.error("API to get host tags failed: " + error.status + " " + error.statusText);
            }
        }

        /**
         * Get all fates, for references
         * @returns {*}
         */
        function getFates() {
            return $http.get("/api/v1/fates?expand=eventtypes&limit=all")
                .then(getFatesComplete)
                .catch(getFatesFailed);

            function getFatesComplete(response) {
                //console.debug("Got Fates! " + response.data.fates);
                return response.data.fates;
            }

            function getFatesFailed(error) {
                console.error("API call to get Fates failed. "  + error.status + " " + error.statusText)
            }
        }

        /**
         * Get the fates but return them as a JSON that's consumable by SigmaJS
         */
        function getFatesSigma() {
            var graphData = {
                    nodes: [],
                    edges: []
                };

            var XINC = 0.5;
            var YINC = .2;
            var baseY = 0;  // used to track y coords when laying out graph

            return getFates().then(processFates).then(function() {
                var baseX = 0;

                // Go back through the nodes and assign them coordinates for
                // display
                for (var idx in graphData.nodes) {
                    if (graphData.nodes[idx]["id"][0] == "r") {
                        layoutGraph(baseX, graphData.nodes[idx]);
                    }
                }

            })
                .then(function() {
                return graphData;
            });

            /**
             * Process the fates into a nice node-link map
             * @param fates fates to process
             */
            function processFates(fates) {
                // first, let's graph out the nodes and the edges,
                // but we won't add positions until afterwards
                for (var x in fates) {
                    var rootId;
                    if (!fates[x]["follows_id"]) {
                        rootId = createRootNode(fates[x]["creationEventType"]);
                    } else {
                        rootId = "f" + fates[x]["follows_id"] + "c";
                    }
                    var childId = createChildNode(
                        fates[x]["completionEventType"],
                        fates[x]["id"]
                    );
                    createEdge(
                        fates[x]["id"], rootId, childId,
                        fates[x]["description"]
                    );
                }
            }


            /**
             * Create a node that will be the start of a chain
             */
            function createRootNode(creationEventType) {
                var id = 'r' + creationEventType["id"];

                for (var node_id in graphData.nodes) {
                    if (graphData.nodes[node_id]["id"] == id) {
                        // we found an existing node with the same id
                        // so we must already have this defined. Exit
                        return id;
                    }
                }

                // not having found a matching node, we will create one
                var node = {
                    id: id,
                    size: 1,
                    type: 'rootNode',
                    label: creationEventType["category"] + ' ' + creationEventType["state"]
                };

                graphData.nodes.push(node);

                return id;
            }

            /**
             * Create a node that will be a child of the fate identified
             */
            function createChildNode(completionEventType, fateId) {
                var id = "f" + fateId + "c";

                var node = {
                    id: id,
                    size: 1,
                    type: 'childNode',
                    label: completionEventType["category"] + ' ' + completionEventType["state"]
                };

                graphData.nodes.push(node);

                return id;
            }

            /**
             * Create an edge between two nodes
             */
            function createEdge(fateId, nodeId1, nodeId2, desc) {
                var edge = {
                    id: "fe" + fateId,
                    source: nodeId1,
                    target: nodeId2,
                    type: 'fateFlow',
                    label: desc
                };

                graphData.edges.push(edge);
            }

            /**
             * Go back through the nodes and assign them coordinates for
             * display
             */
            function layoutGraph(baseX, node) {
                // update the x and y coords of this node
                node["x"] = baseX;
                node["y"] = baseY;

                // all children will be to the right
                baseX += XINC;

                // find all children and iterate
                var foundChildren = false;
                for (var idx in graphData.edges) {
                    if (graphData.edges[idx]["source"] == node["id"]) {
                        var childNode = findNode(graphData.edges[idx]["target"])
                        if (childNode) {
                            foundChildren = true;
                            layoutGraph(baseX, childNode);
                            baseY += YINC;
                        }
                    }
                }

                if (!foundChildren) {
                    node["type"] = "endNode";
                }
            }

            /**
             * Quick way to search and find the node with a given ID
             */
            function findNode(searchId) {
                for (var idx in graphData.nodes) {
                    if (graphData.nodes[idx]["id"] == searchId) {
                        return graphData.nodes[idx];
                    }
                }

                return null;
            }
        }

        /**
         * Get a list of event types that can start non-intermediate labors
         * @returns {*}
         */
        function getStartingEventTypes() {
            return $http.get("/api/v1/eventtypes?startingTypes=true&limit=all")
                .then(getStartingEventTypesComplete)
                .catch(getStartingEventTypesFailed);

            function getStartingEventTypesComplete(response) {
                return response.data.eventTypes;
            }

            function getStartingEventTypesFailed(error) {
                console.error("API call to get starting EventTypes failed. "
                    + error.status + " " + error.statusText);
                throw error;
            }
        }


        /**
         * Get all event-types that users are allowed to throw.  Basically,
         * this is any event-type of state "ready."
         * @returns {*}
         */
        function getUserThrowableEventTypes() {
            return $http.get("/api/v1/eventtypes?limit=all&state=ready")
                .then(getCompleted)
                .catch(getFailed);

            function getCompleted(response) {
                return response.data.eventTypes;
            }

            function getFailed(error) {
                console.error("API call to get user throwable event-types failed. "
                    + error.status + " " + error.statusText);
                throw error;
            }
        }

        /**
         * Get all event-types that quest creators are allowed to throw.  Basically,
         * this is any event-type of state "completed."
         * @returns {*}
         */
        function getQuestCreatorThrowableEventTypes() {
            return $http.get("/api/v1/eventtypes?limit=all&state=completed")
                .then(getCompleted)
                .catch(getFailed);

            function getCompleted(response) {
                return response.data.eventTypes;
            }

            function getFailed(error) {
                console.error("API call to get creator throwable event-types failed. "
                    + error.status + " " + error.statusText);
                throw error;
            }
        }

        /**
         * Run a given query against the extquery passthrough service
         * @param queryString the string to run
         * @returns {*}
         */
        function runQuery(queryString) {
            return $http.get("/api/v1/extquery?query=" + queryString)
                .then(runQueryComplete)
                .catch(runQueryFailed);

            function runQueryComplete(response) {
                return response.data.results.sort();
            }

            function runQueryFailed(error) {
                console.error("API call to get run query failed. "  + error.status + " " + error.statusText);
                throw error;
            }
        }
    }

    angular.module('hermesApp')
        .factory('HermesService',HermesService);

    HermesService.$inject = ["$http", "$q"];

})();