// Reference to your database location
const listsRef = firebase.database().ref('lists');

// Save data
function saveList(name, data) {
    listsRef.child(name).set(data);
}

// Load data
function loadList(name, callback) {
    listsRef.child(name).once('value', snapshot => {
        const data = snapshot.val();
        callback(data);
    });
}

// Delete data
function deleteList(name) {
    listsRef.child(name).remove();
}
