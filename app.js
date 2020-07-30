
//MODULE 1 //BUDGET CONTROLLER
var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1; 
    };
    Expense.prototype.calcPercentages = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome)*100);
        }else{
            this.percentage = -1;
        }  
    };
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
 
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
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
        addItem: function(type, des, val) {
            var newItem, ID;
            
            //[1 2 3 4 5], next ID = 6
            //[1 2 4 6 8], next ID = 9
            // ID = last ID + 1
            
            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // Push it into our data structure
            data.allItems[type].push(newItem);
            
            // Return the new element
            return newItem;
        },
        deleteItem: function(type,id){
            var ids,index;

            //id= 6 if we choose to delete id 6 which has the index 3
            //data.allItems[type][id];
            //ids = [1 2 4 8] **if we use splice() then we can delete the index 3 and 1 elements
            //index = 3

            var ids =data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function() {
            
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }            
            
            // Expense = 100 and income 300, spent 33.333% = 100/300 = 0.3333 * 100
        },
        calculatePercentages: function(){
         data.allItems.exp.forEach(function(cur){
            cur.calcPercentages(data.totals.inc);
         });
        },
        getPercentages:function(){
            var allPerc = data.allItems.exp.map(function(cur){
                    return cur.getPercentage();
            });
            return allPerc;
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        testing: function() {
            console.log(data);
        }
};
})();

//MODULE 2 // UI CONTROLLER
var UIController = (function () {

    //OBJECT TO STORE ALL DIV CLASSES STRINGS 
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer:'.income__list',
        expensesContainer:'.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expenseLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container',
        expensePerLabel: '.item__percentage',
        dateLabel:'.budget__title--month'

    }
     //Adding + or - before number exactly 2 decimal points comma separating the thousands 2310.4567 -> + 2,310.46 
    // 2000 -> +2000.00

    var formatNumber = function(num,type){
        var numSplit,int,dec,type;
        num = Math.abs(num);
        num = num.toFixed(2);
     
        numSplit = num.split('.');
        int = numSplit[0];
            if(int.length > 3){
                int = int.substr(0,int.length - 3) + ',' + int.substr(int.length-3,3);// start at position 0 and read 1 number eg:2,100 // Similarly 23,510
            }
        dec = numSplit[1];
       
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function (list, callback) {
        for(var i = 0; i<list.length; i++){
              callback(list[i], i); 
        }      
   };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,// Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        addlistItem: function(obj,type){
            var html, newHtml,element; 
            // create HTML string with placeholder text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
           html =  '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div> <div class="right clearfix">  <div class="item__value">%value%</div>   <div class="item__delete"><button class="item__delete--btn"> <i class="ion-ios-close-outline"></i> </button> </div>  </div> </div>';
            }else if(type === 'exp'){
                element = DOMstrings.expensesContainer;
          html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml)
        },
        //deleting item from UI
            deleteListItem:function(selectorId){
              var el= document.getElementById(selectorId);
              el.parentNode.removeChild(el);
              
            },
            
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(cur, index, array) {
                cur.value = "";
            });
            
            fieldsArr[0].focus();
        },
        displayBudget:function(obj){
            var type;
           obj.budget > 0 ? type= 'inc':type='exp'; 
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type) ;
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc'); 
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp,'exp');
           
            if(obj.percentage > 0 ){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%' ;
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '-----';
            }
        },
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensePerLabel); 
            
        nodeListForEach(fields,function(current,index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent= '---'; 
                }
            });
    },
        displayMonth:function(){
            var now,year;
            now = new Date();
            months =['January','February','March','April','May','June','July','August','September','October','November','December'];
            //var christmas = new Date(2016,11,25);
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedtype: function(){
            var fields = document.querySelectorAll(
            DOMstrings.inputType + ','+ 
            DOMstrings.inputDescription +','+
            DOMstrings.inputValue);
        
        nodeListForEach(fields,function(cur) {
            cur.classList.toggle('red-focus');
        });

       document.querySelector(DOMstrings.inputBtn).classList.toggle('red');   
    },
        getDOMstrings: function () {
            return DOMstrings;
        }
    };
})();

//MODULE 3 // GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    //Setup event listners function

    var setupEventListners = function () {
        //OBJECT TO STORE ALL DIV CLASSES OR HARD CODED STRING 
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (e) {
            if (e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }

        });            
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    // Update budget
    var updateBudget = function() {
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI
        //UICtrl.displayBudget(budget);
        UICtrl.displayBudget(budget);
    };
    
     // Update percentages

     var updatePercentages = function(){
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        //2.Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        //3.Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
        }


    //**Adding the items
    var ctrlAddItem = function () {
        var newItem;
        //1. Get input data....
       var input = UICtrl.getInput();
         
       if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
        //2. Add the item to the budget controller
         newItem = budgetCtrl.addItem(input.type, input.description , input.value)

        //3. Add the item to UI
        UICtrl.addlistItem(newItem,input.type);
        //4. Clear field

        UICtrl.clearFields();
    
        //5. Display the budget on the UI
        updateBudget();

        //6.Calculate and update the percentages

        updatePercentages();
        //console.log('It work s');
       }
    };

   
    //** Deleting the items
        var ctrlDeleteItem = function(event){
            var itemId , splitID ,type, ID;
         itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
         if(itemId){
            //inc-1,//exp-1 // eg:
            // var s = 'inc-1-type-3'
            //s.split('-');
            //output:["inc","1","type","3"]
            //Here type is 'inc' Which 0 element,
            //and '1' which is 1 element and so on 2,3.....n
            splitID = itemId.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
         }
         //1. Delete the item from data structure
         budgetCtrl.deleteItem(type,ID);
         //2. Delete the item from UI
            UICtrl.deleteListItem(itemId)
         //3.Update and show new budget
         updateBudget();
         //4.Calculate and update the percentages
         updatePercentages();

        };
    return {
        init: function () {
            UICtrl.displayMonth();
             UICtrl.displayBudget({
                budget:0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
             });
            setupEventListners();
            console.log('app');
        }
    };

})(budgetController, UIController);

controller.init();
