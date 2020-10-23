self.importScripts('migrations.js');

const filesToCache = [
    '/css/app1.css',
    'index',
    'about',
    '/'
];

/* 
 here index.html and index both are different.
*/

const staticCacheName = 'version-62';
const sw_version = 1;

self.addEventListener('install', function(event) {
    // Perform some task
    callerFn();
    self.skipWaiting();

    event.waitUntil(
      caches.open(staticCacheName)
      .then(cache => {
        return cache.addAll(filesToCache);
      })
    );
});


self.addEventListener('activate', function(event) {
    // Perform some task
    self.clients.claim();
    console.log('self', self);
    // self.postMessage("Hi client, I am activated");
    console.log('activated')
});


self.onactivate = function(event) {
  console.log('on activate??', event);
}


self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
    .then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request)
      // TODO 4 - Add fetched files to the cache
    }).catch(error => {
      // TODO 6 - Respond with custom offline page
    })
  );
});

addEventListener('message', event => {
  console.log(`The client sent me a message`,event);
  event.waitUntil(
    checkIfMigrationRequired().then(response => {
      if(response.status === 'migration-required') {
        event.source.postMessage(response);
      }
      // what if migration is not required?
      console.log('response321', response);
    }).catch(err => {
      // what if the migration is rejected?
      console.log('err', err)
    })
  )

  // where should we clear this cache? after migrations or before?
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== staticCacheName) {
          return caches.delete(key);
        }
      }));
    })
  );

  // event.source.postMessage("Hi client");
});


self.addEventListener('fetch', event => {
  // console.log('Fetch event for2 ', event);
  if (event.request.url === 'http://127.0.0.1:3000/sw.js') {
    console.log('sw called');
    console.log('client', event);
  }
})


function checkIfMigrationRequired() {
  console.log('migrate function called from install');
  return new Promise(async(resolve, reject) => {
    try {
      // do the version comparison
      const cacheNames = await caches.keys();
      const versionCaches = cacheNames.filter(      
        (cacheNames) => (cacheNames.startsWith(`version-`))
      );
      let oldVersionNumbers = [];
      if(versionCaches.length) {
        versionCaches.map((version) => {
          oldVersionNumbers.push(parseInt(version.split('-')[1]));
        })
      }
      let newVersionNumber = JSON.parse(staticCacheName.split('-')[1]);

      if(oldVersionNumbers.length) {
        oldVersionNumbers = oldVersionNumbers.sort();
        console.log('versions', oldVersionNumbers[0], newVersionNumber)
        
        if(oldVersionNumbers[0] < newVersionNumber) {
          console.log('version update available')
          resolve({status: 'migration-required', old_version: oldVersionNumbers[0], new_version: newVersionNumber});
        } else {
          // do nothing and update to new version
          console.log('dont run migrations');
          resolve('migration-not-required');
        }
      } else {
        resolve('migration-not-required');
      }
    } catch (error) {
        reject('failed');
    }
   
  })
}

