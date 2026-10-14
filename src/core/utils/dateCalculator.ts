function getDaysInMonth(year:any, month:any) {
    return new Date(year, month, 0).getDate();
  }


let calculateCurrentDate=function(){

    const date = new Date();
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth() + 1; // 👈️ months are 0-based
    
    // 👇️ Current Month
    const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
    // console.log(daysInCurrentMonth);

  
    let fromDate=new Date(`${currentYear}/${currentMonth}/1`);
    let toDate=`${currentYear}/${currentMonth}/${daysInCurrentMonth}`
    const dates = [];

    let loop=1;
    while(loop<=daysInCurrentMonth) {
        dates.push(new Date(fromDate).toLocaleString().split(",")[0]);
        fromDate.setDate(fromDate.getDate() + 1);
        loop++;
      }

      return {dates,currentMonth};
}


export {calculateCurrentDate};
