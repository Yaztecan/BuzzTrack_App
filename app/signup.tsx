// app/signup.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from 'expo-router';
import { auth, db } from '../firebase/firebase';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

function isValidEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export default function SignUpScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSignUp = async () => {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }if (isSubmitting) return; // Prevent multiple presses

    setIsSubmitting(true); // Disable the button
    setError(''); // Clear previous error

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);

      const uid = userCredential.user.uid;
      await setDoc(doc(db, 'users', uid), {
        email,
        createdAt: serverTimestamp(),
      });

      console.log('User signed up, verification email sent, Firestore doc created!');
      setError('Verification email sent. Please check your inbox.');
      
      setTimeout(() => {
        router.push('/login');
        setIsSubmitting(false);
      }, 5000); 

    } catch (err) {
      console.error('Error signing up:', err);
      setError('Failed to create an account. Please try again.');
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={(event) => {
        if (event.target instanceof HTMLElement && event.target.tagName !== 'INPUT') {
          Keyboard.dismiss();
        }
      }}
      accessible={false}
    >
      <KeyboardAwareScrollView
        style={{ flex: 1, backgroundColor: '#F5A124' }}
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        extraScrollHeight={50}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={[styles.card, styles.boxShadow]}>
            <Text style={styles.title}>Sign up!</Text>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#8A8A8A"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              style={styles.input}
            />
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#8A8A8A"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={[styles.input, { paddingRight: 40 }]}
              />
              <Pressable
                style={styles.iconContainer}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
              </Pressable>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="#8A8A8A"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                style={[styles.input, { paddingRight: 40 }]}
              />
              <Pressable
                style={styles.iconContainer}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
              </Pressable>
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable style={[styles.btn, styles.signUpBtn, styles.boxShadow]} onPress={handleSignUp}>
              <Text style={styles.btnText}>Create account</Text>
            </Pressable>
            <Text
              style={[styles.forgotText, { marginTop: 15, textAlign: 'center' }]}
              onPress={() => router.push('/login')}
            >
              Already have an account? Login
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5A124', // same as login background
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 10,
  },
  logo: {
    width: 180,
    height: 180,
  },
  card: {
    flex: 1,
    backgroundColor: '#F5CB24',
    marginTop: 40,
    marginHorizontal: 22,
    borderRadius: 35,
    paddingHorizontal: 30,
    paddingTop: 30,
    shadowColor: '#DD9221'
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#5c3d2b',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 0,
  },
  input: {
    backgroundColor: '#FDF4D2',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  iconContainer: {
    position: 'absolute',
    right: 15,
    top: 10,
    bottom: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  btn: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  signUpBtn: {
    backgroundColor: '#5c3d2b',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotText: {
    fontSize: 14,
    color: '#5c3d2b',
  },
  boxShadow: {
    shadowColor: "#333333",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.1,
    shadowRadius: 17,
  },
});
