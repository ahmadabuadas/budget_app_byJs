var budgetController = (function () {

    var Expense = function (id, description, value, percentage) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calctepercent = function (totalincom) {
        if (totalincom > 0) {
            this.percentage = Math.round((this.value / totalincom) * 100);
        } else {
            this.percentage = -1;
        }
        
    };

    Expense.prototype.getpercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            var newItem, id;
            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0;
            }

            if (type === 'exp') {
                newItem = new Expense(id, des, val);
            } else if (type === 'inc') {
                newItem = new Income(id, des, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },

        calclateBudget: function () {
            // calculate total income and exp
            calculateTotal('exp');
            calculateTotal('inc');
            //caculate incomes-exps
            data.budget = data.totals.inc - data.totals.exp;
            // calculate persentage of income has been spend
            if (data.budget > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatepercentage: function () {
            data.allItems.exp.forEach(function (current) {
                current.calctepercent(data.totals.inc);
            })

        },

        getpercentages: function () {
            var allperc = data.allItems.exp.map(function (current) {
                return current.getpercentage();
            })
            return allperc;
        },

        getbudget: function () {
            return {
                budget: data.budget,
                totalinc: data.totals.inc,
                totalexp: data.totals.exp,
                persantage: data.percentage
            };
        },

        deleteItem: function (type, id) {
            var ids, index;
            ids = data.allItems[type].map(function (current) {
                return current.id; // ???
            });
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        test: function () {
            console.log(data);
        }
    };

})();

////////////////////////////////////////////////////
var UIController = (function () {

    var DOMstring = { // if we change the name of class in defernt project
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputbutton: '.add__btn',
        incomeContainar: '.income__list',
        expensesContainar: '.expenses__list',
        budgetLable: '.budget__value',
        incomLable: '.budget__income--value',
        expenesesLable: '.budget__expenses--value',
        percentageLable: '.budget__expenses--percentage',
        contaner: '.container',
        exppercentagelable: '.item__percentage',
        dateLable: '.budget__title--month'
    };

    var formatnumber = function (number, type) {
        var numsplit, int, dec, type;
        // - + before the number
        //decmal 2 point
        // commma for thousens
        number = Math.abs(number);
        number = number.toFixed(2);

        numsplit = number.split('.');
        int = numsplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numsplit[1];


        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListFoeEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };


    return {

        getInput: function () {
            return { //return 3 variable as object to use outside
                type: document.querySelector(DOMstring.inputType).value, //inc,exp
                description: document.querySelector(DOMstring.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstring.inputValue).value)
            }; // remmber ; after each object
        }, // remmber , bettwen  objects


        addListItem: function (obj, type) {
            //create html dtring to hold
            var html, newHtml, element;
            if (type === 'inc') {
                element = DOMstring.incomeContainar;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstring.expensesContainar;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace the placeholder
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatnumber(obj.value, type));

            //insert to html
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteItem: function (selectorid) {
            var el = document.getElementById(selectorid);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldArr;
            fields = document.querySelectorAll(DOMstring.inputDescription + ', ' + DOMstring.inputValue);
            fieldArr = Array.prototype.slice.call(fields); // change to array

            fieldArr.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstring.budgetLable).textContent = formatnumber(obj.budget, type);
            document.querySelector(DOMstring.incomLable).textContent = formatnumber(obj.totalinc, 'inc');
            document.querySelector(DOMstring.expenesesLable).textContent = formatnumber(obj.totalexp), 'exp';
            if (obj.persantage > 0) {
                document.querySelector(DOMstring.percentageLable).textContent = obj.persantage + '%';
            } else {
                document.querySelector(DOMstring.percentageLable).textContent = '---';
            }

        },

        displayPercentages: function (percntages) {
            var fields = document.querySelectorAll(DOMstring.exppercentagelable);


            nodeListFoeEach(fields, function (current, index) {
                if (percntages[index] > 0) {
                    current.textContent = percntages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function () {
            var now, year, month;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMstring.dateLable).textContent = month + ' ' + year <!--  JQuery  -->
                <
                script src = "https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js" > < /script>;

        },

        changeType: function () {
            var feilds = document.querySelectorAll(DOMstring.inputType + ',' + DOMstring.inputDescription + ',' + DOMstring.inputValue);

            nodeListFoeEach(feilds, function (current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMstring.inputbutton).classList.toggle('red');

        },

        getDomString: function () {
            return DOMstring;
        }



    };

})();




////////////////////////////////////////////////////
var Controller = (function (budgetCtrl, UICtrl) {

    var setListenerEvents = function () {

        var DOM = UIController.getDomString();

        document.querySelector(DOM.inputbutton).addEventListener('click', CtrlAddItem)
        // add key press not jjust click by the mouse
        document.addEventListener('keypress', function (e) {
            if (e.keyCode === 13 || e.which === 13) {
                CtrlAddItem();
            }
        });
        document.querySelector(DOM.contaner).addEventListener('click', contrlDeletItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);

    };

    var updateBudget = function () {
        // calaculat the  budjet
        budgetCtrl.calclateBudget();
        // return the budget
        var budget = budgetCtrl.getbudget();
        // display total budjet ui
        UICtrl.displayBudget(budget);
        //console.log(budget);
    };

    var updatepercentage = function () {
        // calculate percentage
        budgetCtrl.calculatepercentage();
        // read percentage from budgetconttroler
        var percentages = budgetCtrl.getpercentages();
        // update UI
        UICtrl.displayPercentages(percentages);
    };

    var CtrlAddItem = function () {
        var input, newItem;
        // take the input value from ui
        input = UIController.getInput();


        if (!input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //add the value to the income or expenses
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //display it income or expenses ui
            UICtrl.addListItem(newItem, input.type);

            // clear the fields
            UICtrl.clearFields();

            //calculate and update budget
            updateBudget();
            // calculate and update the percentage
            updatepercentage();
        }
    };

    var contrlDeletItem = function (e) {
        var itemID, splitID, type, ID;
        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            // delete the item from data structuer
            budgetCtrl.deleteItem(type, ID);
            // delete it from ui
            UICtrl.deleteItem(itemID);
            //update and show new budget
            updateBudget();
            // calculate and update the percentage
            updatepercentage();

        }
    };

    return {
        init: function () {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalinc: 0,
                totalexp: 0,
                persantage: -1
            });
            setListenerEvents();
        }
    }

})(budgetController, UIController);

Controller.init();
