import {JwtClass} from '../middelwraes/auth.middleware'

module.exports = {
    create: function (data:any) {
       
        let html=`<html>
        <head><style>
        body{
            padding:0;
            margin: 0;
        }
        table{
        
            width: 100%;
            height: 100%;
            border-collapse: collapse;
            border-radius: 20px;
        }
        thead{
            background-color: lightcyan;
        }
        </style>
        <script>
           
                let getOrderDetails= async function(obj){    
                   
                    try
                    {
                         let data=await fetch('http://localhost:8081/orders/doctor/orderdetails/'+obj.id,
                          { 'method':'get', 'headers': { 'Authorization': 'Bearer ${JwtClass.token}'   },
                          'datatype':'application/json'      });
                          
                          let response=await data.json();
                          console.log(response);
                    }  
                    catch(error)
                    {console.log(error)}
                  
                  }
            
        </script>
        </head>
        <body>
        <h1> Month : ${data.currentMonth}</h1>
        <h1> Balance : ${data.balance}</h1>
        <table>
        <tr> <th>OrderDate</th>
            <th>purchaese</th>
            <th>payments</th>
            <th>lateMoney</th></tr>`
        let orders=data.orders;
            for(let index in orders)
        {   
           
            let row=`<tr>
                        <td><a onclick='getOrderDetails(this)' id='${orders[index]._id}' href='#'> ${orders[index].orderDate}</a></td>
                        <td>${orders[index].payments+orders[index].lateMoney}</td>
                        <td>${orders[index].payments}</td>
                        <td>${orders[index].lateMoney}</td>
                    <tr>`
         html+=row; 
        }
        html+=`</table>
       
        </body></html>`;
        return html;
    }
    
};