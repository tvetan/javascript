/// <reference path="class.js" />
/// <reference path="persister.js" />
/// <reference path="jquery-2.0.2.js" />
/// <reference path="ui.js" />

var controllers = (function () {
    var rootUrl = "http://localhost:22954/api/";
    var Controller = Class.create({
        init: function () {
            this.persister = persisters.get(rootUrl);
            this.updater = null;
            this.interval = 25000;
        },
        renderGameUI: function (selector) {
            var self = this;
            this.updater = setInterval(function () {

                if (self.persister.isUserLoggedIn()) {
                    self.loadActiveGames(selector);
                    self.loadOpenGames(selector)
                }

                if (self.isGameActive()) {
                    var gameId = localStorage.getItem("active-game");
                    console.log("here")
                   self.loadGame(selector, gameId)
                }


            }, this.interval)
        },
        loadUI: function (selector) {
            localStorage.removeItem("active-game")
            if (this.persister.isUserLoggedIn()) {
                this.loadGameUI(selector);
                this.renderGameUI(selector)
            }
            else {
                this.loadLoginFormUI(selector);
            }
            this.attachUIEventHandlers(selector);
        },
        loadLoginFormUI: function (selector) {
            $("#messages").html("")
            var loginFormHtml = ui.loginForm()
            $(selector).html(loginFormHtml);
        },
        loadGameUI: function (selector) {
            console.log(selector)
            var list =
            ui.gameUI(this.persister.nickname());
            $(selector).html(list);

            this.loadOpenGames(selector)

            this.loadActiveGames(selector)

            this.loadMessages("#messages")
        },
        loadGame: function (selector, gameId) {
            this.persister.game.state(gameId, function (gameState) {
                var gameHtml = ui.gameState(gameState);

                $(selector + " #game-holder").html(gameHtml)
                ui.fillEmptyTable(gameState)
            }, function (error) {
                console.log(error)
                var errorType = JSON.parse(error.responseText).Message;
                $("#game-holder").append("<p class='error'>"+errorType+"</p>")
            });
        },
        loadActiveGames: function (selector) {
            this.persister.game.myActive(function (games) {
                var list = ui.activeGamesList(games);
                $(selector + " #active-games")
                .html(list);
            });
        },
        loadOpenGames : function (selector) {
            this.persister.game.open(function (games) {
                var list = ui.openGamesList(games);
                $(selector + " #open-games")
                .html(list);
            }, function (error) {
                console.log(error)
            });
        },
        loadUnreadMessages: function(selector){
            this.persister.messages.unread(function (messages) {
                var list = ui.showMessages(messages);
                $(selector + " #message-list")
                .prepend(list);
            }, function (error) {
                console.log(error);
                console.log("Invalid user authentication - The only posible error with messages");
            })
        },
        loadMessages: function (selector) {
            this.persister.messages.all(function (messages) {
                var list = ui.showMessages(messages);

                $(selector)
                .html(list);
            }, function (error) {
                console.log(error);
                console.log("Invalid user authentication - The only posible error with messages");
            })
        },
        gameInActiveGames: function (gameId) {
            console.log(this)
            this.persister.game.myActive(function (data) {
                var mine = JSON.stringify(data);
                console.log(mine.length)
                console.log(gameId)
                for (var i in mine) {
                    console.log(i)
                    if (i == gameId) {
                        return ;
                    }
                }
                
                $("#game-state #error-block").html("<h2 id='error'>You won the game</h2>")
                return false;
            })
        },

        escapeHtml: function(text){
            var entityMap = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': '&quot;',
                "'": '&#39;',
                "/": '&#x2F;'
            };

           
            return String(string).replace(/[&<>"'\/]/g, function (s) {
                return entityMap[s];
            });
        },
        isGameActive: function () {    
            return localStorage.getItem("active-game") !=null;
        },

        attachUIEventHandlers: function (selector) {
            var wrapper = $(selector);
            var self = this;

            wrapper.on("click", "#btn-show-login", function () {
                wrapper.find(".button.selected").removeClass("selected");
                $(this).addClass("selected");
                wrapper.find("#login-form").show();
                wrapper.find("#register-form").hide();
            });
            wrapper.on("click", "#btn-show-register", function () {
                wrapper.find(".button.selected").removeClass("selected");
                $(this).addClass("selected");
                wrapper.find("#register-form").show();
                wrapper.find("#login-form").hide();
            });

            wrapper.on("click", "#btn-login", function () {
                var user = {
                    username: $(selector + " #tb-login-username").val(),
                    password: $(selector + " #tb-login-password").val()
                }
                localStorage.removeItem("active-game")
                self.persister.user.login(user, function (data) {
                    self.loadGameUI(selector);
                }, function (error) {
                    console.log(error)
                    var errorType = JSON.parse(error.responseText).Message;
                    console.log(errorType);
                    //var errorText = self.filterErrorsLogin(errorType)
                   
                    wrapper.append("<div class='invalid-user-information'>"+ errorType +"</div>");
                });

                return false;
            });
            wrapper.on("click", "#btn-register", function () {
                var user = {
                    username: $(selector + " #tb-register-username").val(),
                    nickname: $(selector + " #tb-register-nickname").val(),
                    password: $(selector + " #tb-register-password").val()
                }

                self.persister.user.register(user, function (data) {
                    console.log(selector)
                    self.loadGameUI(selector)
                }, function (error) {
                    console.log(error);
                    wrapper.html(error.responseText)
                })

                return false;
            });
            wrapper.on("click", "#btn-logout", function () {
                self.persister.user.logout(function () {
                    self.loadLoginFormUI(selector);
                });
                localStorage.removeItem("active-game")
            });

            wrapper.on("click", "#open-games-container a", function () {
                $("#game-join-inputs").remove();
                var html =
                '<div id="game-join-inputs">' +
                //'Number: <input type="text" id="tb-game-number"/>' +
                'Password: <input type="text" id="tb-game-pass"/>' +
                '<button id="btn-join-game">join</button>' +
                '</div>';
                $(this).after(html);
            });
            wrapper.on("click", "#btn-join-game", function () {
                var game = {
                    number: $("#tb-game-number").val(),
                    gameId: $(this).parents("li").first().data("game-id")
                };

                var password = $("#tb-game-pass").val();

                if (password) {
                    game.password = password;
                }
                self.persister.game.join(game, function (data) {
                    self.loadActiveGames(selector);
                    self.loadUnreadMessages("#messages");
                    $(selector + " #game-join-inputs").remove();
                }, function (error) {
                    console.log(error)
                });
            });
            wrapper.on("click", "#btn-create-game", function () {
                var game = {
                    title: $("#tb-create-title").val(),
                    //number: $("#tb-create-number").val(),
                }
                var password = $("#tb-create-pass").val();
                if (password) {
                    game.password = password;
                }
                self.persister.game.create(game, function () {
                    self.loadActiveGames(selector)
                    $("#create-game-holder .error-game-create").html("")
                }, function (error) {
                    var errorType = JSON.parse(error.responseText).Message;
                    $("#create-game-holder .error-game-create").html(errorType)
                    console.log(error)
                });

                return false;
            });

            wrapper.on("click", ".active-games .in-progress", function () {
                self.loadGame(selector, $(this).parent().data("game-id"));
                localStorage.setItem("active-game", $(this).parent().data("game-id"))
            });

            wrapper.on("click", ".active-games .full", function () {
                self.persister.game.start($(this).parent().data("game-id"), function (data) {
                    self.loadActiveGames(selector)
                }, function (error) {
                    console.log(error)
                });
            })

            wrapper.on("click", "#game-state #btn-guess-number", function () {
                var gameId = $(this).parent().parent().data("game-id");
                
                self.persister.guess.make($("#guessed-number").val(), $(this).parent().parent().data("game-id"), function (data) {
                    self.loadGame(selector, gameId)
                }, function (error) {
                    console.log("here")
                    if (JSON.parse(error.responseText).errCode == "INV_OP_TURN") {
                        $("#game-state #error-block").html("<h2 id='error'>Sorry but it is not your turn</h2>")
                    }
                    else {
                        console.log(error)
                    }
                })
            })

            wrapper.on("click", "#game-state #btn-move-unit", function () {
                var input = ui.moveInputs;
                $(selector + " #command-inputs").html(input)
            })

            wrapper.on("click", "#game-state #btn-attack-unit", function () {
                
                var input = ui.attackInputs;
                $(selector + " #command-inputs").html(input)
            })

            wrapper.on("click", "#game-state #btn-defend-unit", function () {
                var input = ui.defendInputs;
                $(selector + " #command-inputs").html(input)
            })

            // commands
            wrapper.on("click", "#game-state #btn-move-command", function () {
                
                var moveTarget = $(selector + " #target-to-move").val();
                var gameId = localStorage.getItem("active-game");
                var unitId = parseInt($("#" + moveTarget).attr("data-unit-id"));

                var positionToMove = $(selector + " #position-to-move").val();

                var position = {
                    x: positionToMove[0],
                    y: positionToMove[2]
                }
                
                //gameId, unitId, position, success, error
                self.persister.battle.move(gameId, unitId,position,function () {
                    self.loadGame(selector,gameId)
                }, function (error) {
                    var errorType = JSON.parse(error.responseText).Message;
                    $(selector + " #error-block").text(errorType)
                })
            })

            wrapper.on("click", "#game-state #btn-attack-command", function () {

                var moveTarget = $(selector + " #target-to-attack").val();
                var gameId = localStorage.getItem("active-game");
                var unitId = parseInt($("#" + moveTarget).attr("data-unit-id"));

                var positionToMove = $(selector + " #position-to-attack").val();

                var position = {
                    x: positionToMove[0],
                    y: positionToMove[2]
                }

                //gameId, unitId, position, success, error
                self.persister.battle.move(gameId, unitId, position, function () {
                    self.loadGame(selector, gameId)
                }, function (error) {
                    var errorType = JSON.parse(error.responseText).Message;
                    $(selector + " #error-block").text(errorType)
                })

                //gameId, unitId, position, success, error
                self.persister.battle.attack(gameId, unitId, position, function () {

                }, function (error) {
                    var errorType = JSON.parse(error.responseText).Message;
                    $(selector + " #error-block").text(errorType)
                })
            })

            wrapper.on("click", "#game-state #btn-defend-command", function () {
                
                var deffendId = $(selector + " #target-to-defend").val();
                var unitId = parseInt($("#" + deffendId).attr("data-unit-id"));
                var gameId = localStorage.getItem("active-game");
                self.persister.battle.defend(gameId, unitId, function () {
                    console.log("we defended")
                }, function (error) {
                    var errorType = JSON.parse(error.responseText).Message;
                    $(selector +" #error-block").text(errorType)
                })
            })

        }
    });
    return {
        get: function () {
            return new Controller();
        }
    }
}());

$(function () {
    var controller = controllers.get();
    controller.loadUI("#content");
});