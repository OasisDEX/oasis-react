// /**
//  * Startup code
//  */
// Meteor.startup(() => {
//   initSession();
//
//   const syncingInterval = setInterval(
//       () => {
//         if (Session.get('web3ObjReady')) {
//           checkNetwork();
//
//           web3Obj.eth.filter('latest', () => {
//             Tokens.sync();
//             Limits.sync();
//             Transactions.sync();
//             TokenEvents.syncTimestamps();
//           });
//
//           web3Obj.eth.isSyncing((error, sync) => {
//             if (!error) {
//               Session.set('syncing', sync !== false);
//
//               // Stop all app activity
//               if (sync === true) {
//                 // We use `true`, so it stops all filters, but not the web3Obj.eth.syncing polling
//                 web3Obj.reset(true);
//                 checkNetwork();
//                 // show sync info
//               } else if (sync) {
//                 Session.set('startingBlock', sync.startingBlock);
//                 Session.set('currentBlock', sync.currentBlock);
//                 Session.set('highestBlock', sync.highestBlock);
//               } else {
//                 Session.set('outOfSync', false);
//                 Offers.sync();
//                 web3Obj.eth.filter('latest', () => {
//                   Tokens.sync();
//                   Limits.sync();
//                   Transactions.sync();
//                 });
//               }
//             }
//           });
//           clearInterval(syncingInterval);
//         }
//       }, 350,
//   );
//
//   // Session.set('web3Interval', web3Interval);
//
//   function syncAndSetMessageOnError(document) {
//     Offers.syncOffer(document.object.id);
//     if (document.receipt.logs.length === 0) {
//       const helperMsg = `${document.object.status.toUpperCase()}: Error during Contract Execution`;
//       Offers.update(document.object.id, { $set: { helper: helperMsg } });
//     }
//   }
//
//   function setMessageAndScheduleRemovalOnError(document) {
//     // The ItemUpdate event will be triggered on successful generation, otherwise set helper
//     if (document.receipt.logs.length === 0) {
//       Offers.update(
//           document.object.id,
//           { $set: { helper: 'Error during Contract Execution' } },
//       );
//       Meteor.setTimeout(() => {
//         Offers.remove(document.object.id);
//       }, 5000);
//     }
//   }
//
//   Transactions.observeRemoved('offer', (document) => {
//     switch (document.object.status) {
//       case Status.CANCELLED:
//         syncAndSetMessageOnError(document);
//         break;
//       case Status.BOUGHT:
//         syncAndSetMessageOnError(document);
//         break;
//       case Status.PENDING:
//         setMessageAndScheduleRemovalOnError(document);
//         break;
//       default:
//         break;
//     }
//   });
//
//   Meteor.setInterval(checkNetwork, 2503);
//   Meteor.setInterval(checkAccounts, 10657);
//   Meteor.setInterval(checkMarketOpen, 11027);
// });
//
// // Meteor.autorun(() => {
// //   TokenEvents.watchEvents();
// //   WGNT.watchBrokerCreation();
// //   WGNT.watchBrokerTransfer();
// //   WGNT.watchBrokerClear();
// //   WGNT.watchWithdraw();
// // });