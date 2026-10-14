var PdfTable = require('voilab-pdf-table'),
    PdfDocument = require('pdfkit');

module.exports = {
    create: function (data:[],info:any) {
        // create a PDF from PDFKit, and a table from PDFTable
        var pdf = new PdfDocument({
                autoFirstPage: false,
                font:"Times-BoldItalic",
            
            })
            .fontSize(13)
            ,
            table = new PdfTable(pdf, {
                bottomMargin: 30,
                topMargin:30,
                
            })
        // pdf.text("hello",100,100)
        table
            // add some plugins (here, a 'fit-to-width' for a column)
            .addPlugin(new (require('voilab-pdf-table/plugins/fitcolumn'))({
                column: 'orderDate'
            }))
            
            // set defaults to your columns
            .setColumnsDefaults({
                headerBorder: 'B',
                border:'B',
                align:"center",
             
                width:70,
                height: 30,
                valign: 'center',
                padding: [0, 5, 5, 5],
                headerPadding: [0, 5, 5, 5],    
                
            })
            // add table columns
            .addColumns([
                {
                    id: 'orderDate',
                    header: 'orderDate',
                    align: 'left',
                    
                
                   
                },
                {
                    id: 'purchases',
                    header: 'purchases',
                    renderer: function (tb:any, data:any) {
                        return Number(data.payments)+Number(data.lateMoney);
                    }
                  
                },
                {
                    id: 'payments',
                    header: 'payments',
                  
                },
                {
                    id: 'lateMoney',
                    header: 'lateMoney',
            
                }
            ])
            // add events (here, we draw headers on each new page)
            .onPageAdded(function (tb:any) {
                
                tb.addHeader();
            });

        // if no page already exists in your PDF, do not forget to add one
        pdf.addPage();
        pdf.text(" Month : "+info.currentMonth)
        pdf.text(" Balance : "+info.balance)

        // draw content, by passing data to the addBody method
        table.addBody(data
        //     [
        //     {orderDate: 'Product 1', purchases: 1, payments: 20.10, lateMoney: 20.10},
        //     {orderDate: 'Product 2', purchases: 4, payments: 4.00, lateMoney: 16.00},
        //     {orderDate: 'Product 3', purchases: 2, payments: 17.85, lateMoney: 35.70}
        // ]
        );

        table.onPageAdd(function (table:any, row:any, ev:any) {
            // do something like
            table.pdf.addPage();
            // cancel event so the automatic page add is not triggered
            ev.cancel = true;
        });

        return pdf;
    }
};