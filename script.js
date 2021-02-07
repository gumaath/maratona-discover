const themeToggle = document.querySelector(".switch input")
function switchTheme(e) {
  if (e.target.checked) {
    document.documentElement.setAttribute("data-theme", "dark");

    localStorage.setItem("theme", "dark")
  } else {
    document.documentElement.setAttribute("data-theme", "light")
    localStorage.setItem("theme", "light")
  }
}
themeToggle.addEventListener("change", switchTheme, false);

const currentTheme = localStorage.getItem("theme")
if (currentTheme) {
  document.documentElement.setAttribute("data-theme", currentTheme);
  if (currentTheme === "dark") {
    themeToggle.checked = true;
  }
}

const Datelimit = {
  updateDate() {
    n =  new Date();
    y = n.getFullYear();
    m = n.getMonth()
    if (m < 9) {
    m = "0" + (n.getMonth() + 1)
    } else {
    m = n.getMonth() + 1
    }
    d = n.getDate();
    if (d < 9) {
    d = "0" + n.getDate();
    } else {
    n.getDate()
    }
    let dateFormat = document.getElementById("date");
    dateFormat.max = y + "-" + m + "-" + d;
    return dateFormat.max
  }
  
}
const Modal = {
  open() {
    document.querySelector(".modal-overlay").classList.add("active")
  },
  close() {
    document.querySelector(".modal-overlay").classList.remove("active")
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },
  set(transactions) {
    localStorage.setItem("dev.finances:transactions",
    JSON.stringify(transactions))
  }
}

const Transaction = {
  all: Storage.get(),
  add(transaction) {
    Transaction.all.push(transaction)

    App.reload()
    },

    remove(index) {
      Transaction.all.splice(index, 1)

      App.reload()
    },

  incomes() {
    let income = 0;
    // para cada transacao, pegar todas as transações
    Transaction.all.forEach(transaction => {
      // se for maior que 0
      if (transaction.amount > 0) {
        income += transaction.amount;
      }

    })
    // somar uma variavel e retonar variavel
    return income
  },
  expenses() {
    let expense = 0;

    Transaction.all.forEach(transaction => {
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    })
    return expense
  },
  total() {
    return Transaction.incomes() + Transaction.expenses();
  }
}

const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),
  addTransaction(transaction, index) {
    const tr = document.createElement("tr")
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    DOM.transactionsContainer.appendChild(tr)
  },
  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense"

    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="">
      </td>
  `
    return html
  },

  updateBalance() {
    document.querySelector("#expenseDisplay")
      .innerHTML = Utils.formatCurrency(Transaction.expenses())
    document.querySelector("#entryDisplay")
      .innerHTML = Utils.formatCurrency(Transaction.incomes())
    document.querySelector("#totalDisplay")
      .innerHTML = Utils.formatCurrency(Transaction.total())
  },

  clearTransactions(){
    DOM.transactionsContainer.innerHTML = ""
  }
}

const Form = {
  description : document.querySelector("#descript"),
  amount : document.querySelector("#amount"),
  date : document.querySelector("#date"),

  getValues() {
    return {
      description: Form.description.value, 
      amount: Form.amount.value,
      date: Form.date.value,
    }
  },
  validateFields() {
    const {description, amount, date} = Form.getValues()
    if (description.trim() === "" || amount.trim() === "" || date.trim() === "" && amount == Number) {
      throw new Error("Por favor, preencha todos os campos!")
    }
  },
  formatValues() {
    let {description, amount, date} = Form.getValues()
    amount = Utils.formatAmount(amount) 
    date = Utils.formatDate(date)
    
    return {
      description,
      amount,
      date
    }
  },
  clearFields() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },
  validateNumber() {
    let {amount} = Form.getValues()    
    var res = amount.match(/((0)+(\.[1-9](\d)?))|((0)+(\.(\d)[1-9]+))|(([1-9]+(0)?)+(\.\d+)?)|(([1-9]+(0)?)+(\.\d+)?)/)
    if (res === null) {
      throw new Error("Por favor, use apenas números!")
    }
  },
  submit(event) {
    event.preventDefault()

try {
    Form.validateFields()
    Form.validateNumber()
    const transaction = Form.formatValues()
    // salvar
    Transaction.add(transaction)
    // apagar os dados do formulario
    Form.clearFields()
    // modal feche
    Modal.close()
} catch (error) {
  alert(error.message)
}
    // Salvar
    // apagar os dados do formulario
    // modal feche
  }
}

const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : ""
    value = String(value).replace(/\D/g, "")
    value = Number(value) / 100
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
    return (signal + value)
  },
  formatAmount(value) {
    value = Number(value.replace(",",".")) * 100
    return Math.round(value)
  },
  formatDate(date) {
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },
}


const App = {
  init() {
    Transaction.all.forEach(function (transaction, index) {
      DOM.addTransaction(transaction, index)
    })
      DOM.updateBalance()    

      Datelimit.updateDate()

      Storage.set(Transaction.all)
  }, 

  reload() {
    DOM.clearTransactions()
    App.init()
  },
}


App.init()