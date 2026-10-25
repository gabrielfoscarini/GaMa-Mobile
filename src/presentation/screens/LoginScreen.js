import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { autenticar } from '../../application/ordens';
import { Button, Feedback, Field, styles } from '../components/ui';

export default function LoginScreen({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [visivel, setVisivel] = useState(false);
  const [error, setError] = useState('');
  function entrar() {
    if (autenticar(usuario, senha)) onLogin();
    else setError('Usuário ou senha incorretos. Tente novamente.');
  }
  return <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { flexGrow: 1, justifyContent: 'center' }]}>
      <View style={{ backgroundColor: '#162C35', padding: 26, borderRadius: 22, gap: 12 }}>
        <Text style={{ color: '#8ED8C3', fontSize: 13, fontWeight: '800', letterSpacing: 3 }}>OFICINA • DEMONSTRAÇÃO</Text>
        <Text style={{ color: 'white', fontSize: 36, fontWeight: '800' }}>GaMa<Text style={{ color: '#8ED8C3' }}> Mobile</Text></Text>
        <Text style={{ color: '#D3E3E6', fontSize: 16, lineHeight: 24 }}>Da inspeção à conclusão. Seu atendimento, organizado no aparelho.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.heading}>Acesse sua oficina</Text>
        <Field label="Usuário" value={usuario} onChangeText={setUsuario} autoCapitalize="none" autoCorrect={false} placeholder="Digite seu usuário" />
        <Field label="Senha" value={senha} onChangeText={setSenha} secureTextEntry={!visivel} autoCapitalize="none" autoCorrect={false} onSubmitEditing={entrar} placeholder="Digite sua senha" />
        <Button secondary title={visivel ? 'Ocultar senha' : 'Mostrar senha'} onPress={() => setVisivel(!visivel)} />
        <Feedback error={error} />
        <Button title="Entrar" onPress={entrar} />
      </View>
      <Text style={[styles.muted, { textAlign: 'center' }]}>Projeto acadêmico • Acesso local{ '\n' }Sem conexão com ERP</Text>
    </ScrollView>
  </KeyboardAvoidingView>;
}
