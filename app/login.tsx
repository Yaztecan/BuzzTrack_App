import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  Keyboard,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { auth } from '../firebase/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

function isValidEmail(email: string) {
  // Looser regex to allow more TLDs
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    // Validate email
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      // Sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;

      // Verify email
      if (!currentUser.emailVerified) {
        await signOut(auth);
        setError('Please verify your email before logging in.');
        return;
      }

      // Otherwise, go to home
      router.push('/tabs');
    } catch (err) {
      console.error('Error logging in:', err);
      setError('Invalid email or password.');
    }
  };

  return (
    <Pressable
      style={{ flex: 1 }}
      onPress={(event) => {
        // Dismiss keyboard only if not tapping an input on web
        if (event.target instanceof HTMLElement && event.target.tagName !== 'INPUT') {
          Keyboard.dismiss();
        }
      }}
    >
      <KeyboardAwareScrollView
        style={{ flex: 1, backgroundColor: '#F5A124' }}
        contentContainerStyle={{ flexGrow: 1 }}
        extraScrollHeight={50}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
      >
        <View style={styles.container}>
          {/* Logo */}
          <View style={[styles.logoContainer]}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Card */}
          <View style={[styles.card, styles.boxShadow]}>
            <Text style={styles.title}>Welcome!</Text>

            {/* Email Input */}
            <TextInput
              placeholder="Email"
              placeholderTextColor="#8A8A8A"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />

            {/* Password + Eye Icon */}
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#8A8A8A"
                style={[styles.input, { paddingRight: 40 }]}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                style={styles.iconContainer}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="gray" />
              </Pressable>
            </View>

            {/* Forgot Password */}
            <Pressable onPress={() => console.log('Forgot Password pressed')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>

            {/* Error Message */}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.btn, styles.signUpBtn, styles.boxShadow]}
                onPress={() => router.push('/signup')}
              >
                <Text style={styles.btnText}>Sign up</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.loginBtn, styles.boxShadow]}
                onPress={handleLogin}
              >
                <Text style={styles.btnText}>Login</Text>
              </Pressable>
            </View>

            {/* Social Login */}
            <Text style={styles.orLoginText}>or login with:</Text>
            <View style={styles.socialRow}>
              <Pressable style={styles.socialIcon} onPress={() => console.log('Apple login')}>
                <Ionicons name="logo-apple" size={24} color="black" />
              </Pressable>
              <Pressable style={styles.socialIcon} onPress={() => console.log('Google login')}>
                <Ionicons name="logo-google" size={24} color="black" />
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5A124', // bright honey/bee color
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
    paddingTop: 40,
    shadowColor: '#DD9221',
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#5c3d2b',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FDF4D2',
    borderRadius: 16,
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
  forgotText: {
    fontSize: 14,
    color: '#5c3d2b',
    marginBottom: 15,
    textAlign: 'right',
  },
  error: {
    color: 'red',
    marginBottom: 5,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  btn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpBtn: {
    backgroundColor: '#A67B5B',
  },
  loginBtn: {
    backgroundColor: '#5c3d2b',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orLoginText: {
    textAlign: 'center',
    marginVertical: 15,
    color: '#5c3d2b',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxShadow: {
    shadowColor: '#333333',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 17,
  },
});
