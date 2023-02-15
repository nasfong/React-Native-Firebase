import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { TouchableOpacity, Text } from 'react-native'
import { GiftedChat } from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot
} from 'firebase/firestore'

import { signOut } from 'firebase/auth'
import { auth, database } from '../config/firebase'
import { useNavigation } from '@react-navigation/native'
import { AntDesign } from '@expo/vector-icons'
import colors from "../color";

export default function Chat() {
  const [message, setMessage] = useState([])
  const navigation = useNavigation()

  const onSignOut = () => {
    signOut(auth).catch(error => console.log(error))
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 10 }}
          onPress={onSignOut}
        >
          <AntDesign name='logout' size={24} color={colors.gray} style={{ marginRight: 10 }} />
        </TouchableOpacity>
      )
    })
  }, [navigation])

  useLayoutEffect(() => {
    const collectionRef = collection(database, 'chats')
    const q = query(collectionRef, orderBy('createdAt', 'desc'))
    console.log('helloo')

    const unsubscribe = onSnapshot(q, snapshot => {
      console.log('snapshot')
      setMessage(
        snapshot.docs.map(doc => ({
          _id: doc.id,
          createdAt: doc.data().createdAt?.toDate(),
          text: doc.data().text,
          user: doc.data().user
        }))
      )
    })

    return () => unsubscribe()
  }, [])
  const onSend = useCallback((message = []) => {
    console.log(message)
    // setMessage(previousMessage => GiftedChat.append(previousMessage, message))

    const { _id, createdAt, text, user } = message[0]
    addDoc(collection(database, 'chats'), {
      _id,
      createdAt,
      text,
      user
    })
  }, [])

  return (
    <GiftedChat
      messages={message}
      onSend={message => onSend(message)}
      user={{
        _id: auth?.currentUser?.email,
        avatar: 'http://i.pravatar.cc/300'
      }}
      messagesContainerStyle={{
        backgroundColor: '#fff'
      }}
    />
  )
}
