window.addEventListener("DOMContentLoaded", (e) => {
    // featch all expenses
    const { token } = JSON.parse(localStorage.getItem("ExpenseTracker"));
  
    //empty table
    let expenseTableBody = document.getElementById("table-data-body");
    expenseTableBody.innerHTML = "";
  
    fetchAllExpenses(token);
  
    // set generic time
    document.querySelector(".info  h3").innerText =
      new Date().toLocaleDateString();
  
    // fetch download history
    fetchHistory(token);
  });
  
  async function fetchAllExpenses(token) {
    try {
      let response = await axios.get("http://localhost:3000/expense", {
        headers: {
          authorization: token,
        },
      });
  
      // console.log(response.data.expenses);
  
      response.data.expenses.map((eacExp) => {
        let { expenseAmount, category, createdAt, updatedAt, description } =
          eacExp;
  
        createdAt = createdAt.substring(0, 10);
        //   console.log(createdAt);
  
        createExpenseIntable(createdAt, category, expenseAmount, description);
      });
    } catch (error) {
      console.log(error);
    }
  }
  
  async function fetchHistory(token) {
    try {
      let response = await axios.get(
        "http://localhost:3000/expense/download/history",
        {
          headers: {
            authorization: token,
          },
        }
      );
  
      // console.log(response.data);
  
      let historyTableBody = document.getElementById("table-download-history");
      historyTableBody.innerHTML = "";
  
      response.data.history.forEach((downloadObj, index) => {
        let { fileName, fileUrl, createdAt } = downloadObj;
  
        // createdAt = createdAt.substring(0, 10);
        // console.log(fileName, fileUrl, createdAt);
  
        addHistoryInTable(createdAt, fileUrl, index);
  
        // createExpenseIntable(createdAt, category, expenseAmount, description);
      });
    } catch (error) {
      console.log(error);
    }
  }
  
  function createExpenseIntable(date, Category, Expense, Description) {
    let td = document.getElementById("table-data-body");
    let newRow = `
          <tr>
              <th scope="row">${date}</th>
              <td>${Category}</td>
              <td>${Expense}</td>
              <td>${Description}</td>
          </tr>
      `;
  
    td.innerHTML += newRow;
  }
  
  // download function
  document.getElementById("download").addEventListener("click", (e) => {
    downloadFile();
  });
  
  async function downloadFile() {
    const { token } = JSON.parse(localStorage.getItem("ExpenseTracker"));
  
    try {
      let response = await axios.get("http://localhost:3000/expense/download", {
        headers: {
          authorization: token,
        },
      });
  
      console.log(response);
  
      let a = document.createElement("a");
  
      a.href = response.data.fileUrl;
      a.download = response.data.fileName;
      a.click();
  
      fetchHistory(token);
    } catch (error) {
      console.log(error);
    }
  }
  
  function addHistoryInTable(date, fileUrl, idx) {
    let td = document.getElementById("table-download-history");
    let newRow = `
        <tr>
          <th scope="row">${idx + 1}</th>
          <td>${date}</td>
          <td>
              <a href="${fileUrl}" target="_blank"         style="text-decoration: none;"            
              rel="noopener noreferrer" >
                redownload
              </a>
          </td>
        </tr>
     `;
  
    td.innerHTML += newRow;
  }