import * as signalR from "@microsoft/signalr"

export default function useWebSocket(
  storeName: string | undefined,
  receiveOrderNotification: any,
  cancelOrderNotification: any
) {
  const isDevelopment = process.env.NODE_ENV === "development"
  const url = isDevelopment ? "/ws/orderhub" : "https://preview.uniqcarttest.com/SteakHouseApi/orderhub"

  // 建立SignalR連接
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(url)
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build()

  // 啟動連接
  connection
    .start()
    .then(function () {
      console.log("SignalR連接已建立")
      connection
        .invoke("AddToGroup", storeName)
        .then(function () {
          console.log(`连接已添加到${storeName}群组`)
        })
        .catch(function (err) {
          return console.error(`无法将连接添加到${storeName}群组: ` + err.toString())
        })
    })
    .catch(function (err: any) {
      return console.error(err.toString())
    })

  // 監聽從伺服器收到的訂單通知事件
  connection.on("ReceiveOrderNotification", function (orderInfo: any) {
    receiveOrderNotification(orderInfo)
  })

  // 監聽從伺服器收到的訂單通知事件
  connection.on("CancelOrderNotification", function (orderInfo: any) {
    cancelOrderNotification(orderInfo)
  })

  return {}
}
