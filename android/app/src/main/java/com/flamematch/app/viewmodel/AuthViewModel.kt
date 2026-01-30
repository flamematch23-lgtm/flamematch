package com.flamematch.app.viewmodel

import androidx.lifecycle.ViewModel
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.flamematch.app.data.User

class AuthViewModel : ViewModel() {
    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()
    
    var currentUser: User? = null
        private set

    fun login(email: String, password: String, onSuccess: () -> Unit, onError: (String) -> Unit) {
        auth.signInWithEmailAndPassword(email, password)
            .addOnSuccessListener { result ->
                result.user?.uid?.let { uid ->
                    loadUserData(uid) { onSuccess() }
                } ?: onError("Errore")
            }
            .addOnFailureListener { e ->
                onError(e.message ?: "Errore login")
            }
    }

    fun register(name: String, email: String, password: String, age: Int, onSuccess: () -> Unit, onError: (String) -> Unit) {
        auth.createUserWithEmailAndPassword(email, password)
            .addOnSuccessListener { result ->
                result.user?.uid?.let { uid ->
                    val user = User(id = uid, name = name, email = email, age = age, points = 100)
                    db.collection("users").document(uid).set(user)
                        .addOnSuccessListener { 
                            currentUser = user
                            onSuccess() 
                        }
                        .addOnFailureListener { e -> onError(e.message ?: "Errore") }
                }
            }
            .addOnFailureListener { e ->
                onError(e.message ?: "Errore registrazione")
            }
    }

    fun logout() {
        auth.signOut()
        currentUser = null
    }

    private fun loadUserData(uid: String, onComplete: () -> Unit) {
        db.collection("users").document(uid).get()
            .addOnSuccessListener { doc ->
                currentUser = doc.toObject(User::class.java)
                onComplete()
            }
            .addOnFailureListener { onComplete() }
    }
}
