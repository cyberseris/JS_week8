 async function getOrderList(){
    await axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        headers:{
          'Authorization': token
        } 
    })
    .then(function(response){
        //console.log(response.data.orders)
        //console.log(response.data.orders.products)
        const data = response.data.orders
        showOrderList(data)
        calcRevenue(data)
        const delSingleOrderBtn = document.querySelectorAll('.delSingleOrder-Btn') 
        for(let i=0;i<data.length;i++){
            delSingleOrderBtn[i].addEventListener('click', function(e){
                deleteSingleOrder(e.target.dataset.id)
            }) 
        }
    })
    .catch(function(err){
        console.log("getOrderList: ", "目前沒有訂單")
    })
 } 

 function showOrderList(orders){
    let list = '';
    let orderProducts;
    if(orders.length){
        orders.forEach(item=>{
            //console.log(item.createdAt)
            const timeStamp = new Date(item.createdAt*1000) 
            //console.log(timeStamp)
            const thisTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;
            //console.log(thisTime) 
            orderProducts = [];
            item.products.forEach(pd=>
                orderProducts.push(pd.title)
            )
            
            list += `<tr>
                        <td>${item.id}</td>
                        <td>
                            <p>${item.user.name}</p>
                            <p>${item.user.tel}</p>
                        </td>
                        <td>${item.user.address}</td>
                        <td>${item.user.email}</td>
                        <td>
                            <p>${orderProducts.join(", ")}</p>
                        </td>
                        <td>${thisTime}</td>
                        <td class="orderStatus">
                            <a href="#">${item.paid?'已處理':'未處理'}</a>
                        </td>
                        <td>
                            <input type="button" class="delSingleOrder-Btn" data-id = ${item.id} value="刪除">
                        </td>
                    </tr>`
        })
    }

    orderList.innerHTML = list
 }

 function calcRevenue(orders){
    let totalObj = {}
    let otherTotal = 0;

    orders.forEach(order=>{
        order.products.forEach(item=>{
            if(totalObj[item.title]){
                totalObj[item.title]+=item.price*item.quantity
            }else{
                totalObj[item.title]=item.price*item.quantity
            }
        })
    })

    let totalObjResult = Object.entries(totalObj).sort((a,b)=>{return b[1]-a[1]})
    
    if(totalObjResult.length>3){
        for(let i=3;i<totalObjResult.length;i++){
            otherTotal+=totalObjResult[i][1]
        }
    
        totalObjResult = totalObjResult.slice(0,3)
        totalObjResult.push(["其他", otherTotal])
    }

    renderChart(totalObjResult)
 }

 function renderChart(data){
   // C3.js
   let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: data
    },
    color:{pattern:["#DACBFF","#9D7FEA","#5434A7","#301E5F"]}
});
 }

 async function deleteSingleOrder(id){
    await axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,{
        headers:{
            'Authorization':token
        }
    })
    .then(function(response){
        console.log(response)
        getOrderList()
    })
    .catch(function(err){
        console.log("deleteSingleOrder error: ", "目前沒有任何訂單")
    })
 }

 async function deleteAllOrders(){
    await axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            'Authorization':token
        }
    })
    .then(function(response){
        console.log(response)
        getOrderList()
    })
    .catch(function(err){
        console.log("deleteAllOrders error: ", "目前沒有任何訂單")
    })
 }

const orderList = document.querySelector('.js-orderList')
const discardAllBtn = document.querySelector('.discardAllBtn')

discardAllBtn.addEventListener('click', function(){
    deleteAllOrders()
})

getOrderList()
renderChart()

   
   
// 預設 JS，請同學不要修改此處
let menuOpenBtn = document.querySelector('.menuToggle');
let linkBtn = document.querySelectorAll('.topBar-menu a');
let menu = document.querySelector('.topBar-menu');
menuOpenBtn.addEventListener('click', menuToggle);

linkBtn.forEach((item) => {
    item.addEventListener('click', closeMenu);
})

function menuToggle() {
    if(menu.classList.contains('openMenu')) {
        menu.classList.remove('openMenu');
    }else {
        menu.classList.add('openMenu');
    }
}
function closeMenu() {
    menu.classList.remove('openMenu');
}
