// Budget Controller Module
// Wrapped in an IIFE for data encapsulation
var budgetController = (function () {

    // Variable for local storage
    var localBudget;

    // Expense function constructor
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    // Add percentage calculation function to each Expense object through its prototype
    Expense.prototype.calcPercentage = function (totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    // Getter function for retrieving percentage
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    // Income function constructor
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

    // Store all items (income, expenses, totals, etc.) into 'data' object
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

    // Local storage function
    function checkForLocal() {
        if (localStorage.getItem('localBudget') === null) {

            // setup data object if no item named 'localBudget' exists
            localBudget = data;
        } else {
            localBudget = JSON.parse(localStorage.getItem('localBudget'));
        }
    }

    return {

        // Check if type is expense or income and create designated item Object
        addItem: function (type, des, val) {
            var newItem, id;

            // Create new id
            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0;
            }

            // Create new item based on type (income or expense)
            if (type === 'exp') {
                newItem = new Expense(id, des, val);
            } else if (type === 'inc') {
                newItem = new Income(id, des, val);
            }

            // Push new item into designated data structure
            data.allItems[type].push(newItem);

            // Return new item
            return newItem;

        },

        deleteItem: function (type, id) {
            var ids, index;

            // Use map function to populate an array with all of the current element's IDs
            var ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            // Use splice method to delete targeted element based on its ID
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        // Calculate budget after newItem entry
        calculateBudget: function () {

            // Call functions that calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of spent income
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        // Calculate the percentage of income for each expense
        calculatePercentages: function () {
            data.allItems.exp.forEach(function (current) {
                current.calcPercentage(data.totals.inc);
            });
        },

        // Retrieve the percentages for each expense
        getPercentages: function () {
            var allPercentages = data.allItems.exp.map(function (current) {
                return current.getPercentage();
            });
            return allPercentages;
        },

        // Retrieve the budget data
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        // Save to local storage
        saveToLocal: function () {

            // Save current data object
            localBudget = data;
            localStorage.setItem('localBudget', JSON.stringify(localBudget));
        },

        // Retrieve from local storage
        getFromLocal: function () {
            checkForLocal();
            return localBudget.allItems;
        },

        testing: function () {
            console.log(data);
        }
    };

})();

// UI Controller Module
// Wrapped in an IIFE for data encapsulation
var UIController = (function () {

    // Create object to allow easy UI customization in the future
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    // Money format each number that is displayed
    var formatNumber = function (num, type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        // Splits the number at the decimal
        numSplit = num.split('.');
        int = numSplit[0];

        // Add commas to any number with more than 3 digits before the decimal using Regex
        if (int.length > 3) {
            int = int.replace(/(\d)(?=(\d{3})+$)/g, "$1,")
        }

        // Splits off the decimal and holds in separate variable
        dec = numSplit[1];

        // Positive or negative sign in front of number and return it
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    // Get input values - whether income/expense, description, and number
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        // Add list item to UI
        addListItem: function (obj, type) {
            var html, newHTML, element;

            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace placeholder text with actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value));

            // Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);

        },

        // Delete item from UI
        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        // Clear the HTML fields
        clearFields: function () {
            var fields, fieldsArr;

            // Get description and value HTML fields
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            // Store fields in an array so they can be manipulated
            fieldsArr = Array.prototype.slice.call(fields);

            // Actually clear the fields
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            // Switch focus back to description for easy entry of items
            fieldsArr[0].focus();
        },

        // Display budget and update the UI
        displayBudget: function (obj) {
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        // Display percentages and update the UI
        displayPercentages: function (percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            nodeListForEach(fields, function (current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        // Get date
        displayDate: function () {
            var now, month, months, year;
            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' of ' + year;
        },

        // Manipulate the color of the input boxes
        changedType: function () {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function (current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        // Make DOMstrings object public
        getDOMstrings: function () {
            return DOMstrings;
        }
    };

})();

// Global App Controller Module
// Wrapped in an IIFE for data encapsulation
var controller = (function (budgetCtrl, UICtrl) {

    // Setup the application's event listeners
    var setupEventListeners = function () {

        // Get DOMstrings object from UI Controller module
        var DOM = UICtrl.getDOMstrings();

        // Check button event listener
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // Event listener for 'Enter' keypress so it does the same thing as clicking check button
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        // Bubbling event listener that is common to the delete button on both income and expense UI
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        // Change event for color swap
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function () {
        // Calculate the budget
        budgetCtrl.calculateBudget();

        // Return the budget
        var budget = budgetCtrl.getBudget();

        // Display budget and update UI
        UICtrl.displayBudget(budget);

        // Save to local storage
        budgetCtrl.saveToLocal();
    };

    var updatePercentages = function () {

        // Calculate the percentages
        budgetCtrl.calculatePercentages();

        // Read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();

        // Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function () {
        var input, newItem;

        // Get field input data
        input = UICtrl.getInput();

        // Data validation for data entry
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // Add new item to user interface
            UICtrl.addListItem(newItem, input.type);

            // Clear the HTML fields after entry
            UICtrl.clearFields();

            // Calculate and update the budget
            updateBudget();

            // Calculate and update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        // Traverse the DOM to get ID element of item after clicking delete button
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // Ensure that an itemID exists on the element
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // Update and show the new budget
            updateBudget();

            // Calculate and update percentages
            updatePercentages();
        }
    };

    // Retrieve data from local storage
    var ctrlRetrieveItem = function () {
        var allItems, incItems, expItems, newItem;
        allItems = budgetCtrl.getFromLocal();
        incItems = allItems.inc;
        expItems = allItems.exp;

        // Retrieve income items and add to UI by calling addListItem
        incItems.forEach(function (item) {
            newItem = budgetCtrl.addItem('inc', item.description, item.value);
            UICtrl.addListItem(newItem, 'inc');
        });

        // Retrieve expense items and add to UI
        expItems.forEach(function (item) {
            newItem = budgetCtrl.addItem('exp', item.description, item.value);
            UICtrl.addListItem(item, 'exp');
        });
    }

    return {
        init: function () {
            console.log('The application has started successfully.')

            // Retrieve locally stored items
            ctrlRetrieveItem();

            // Display date
            UICtrl.displayDate();

            // Clear out fields on application start
            // UICtrl.displayBudget({
            //     budget: 0,
            //     totalInc: 0,
            //     totalExp: 0,
            //     percentage: -1
            // });

            // Update the budget
            updateBudget();

            // Setup event listeners
            setupEventListeners();
        }
    };

})(budgetController, UIController);

// Run the application
controller.init();