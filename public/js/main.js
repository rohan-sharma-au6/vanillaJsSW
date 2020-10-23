if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
  .then(function(registration) {
    console.log('Registration successful, scope is:', registration.scope);
    // registration.addEventListener('updatefound', function() {
    //   console.log('update is found', registration);
    // })
    
  })
  .catch(function(error) {
    console.log('Service worker registration failed, error:', error);
  });

  navigator.serviceWorker.ready
  .then(function(registration) {
    console.log('ready');
    if(registration.waiting) {
      registration.waiting.postMessage("Hi service worker");
    } else {
      registration.active.postMessage("Hi service worker");
    }
  });
  
  // navigator.serviceWorker.onActivate()
  // .then(function(registration) {
  //   console.log('onActivate');
  //   // registration.active.postMessage("Hi service worker");
  // });


  navigator.serviceWorker.addEventListener('message', event => {
    console.log('message received', event.data);
    if (event.data.status === "migration-required") {
      console.log('migrating...');

      const numList = JSON.parse(window.localStorage.getItem('num_list'));

      if(numList && numList.length) {
        let newNumList = [];
        numList.map((item, key) => {
          let newItem = {
            x: item.x,
            y: item.y,
            total_value: parseInt(item.x) + parseInt(item.y) + 40,
          }

          newNumList.push(newItem);
        });

        window.localStorage.setItem('num_list', JSON.stringify(newNumList));

      }

    }
  });
}