import AppNavigator from './src/presentation/navigation/AppNavigator';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StatusBar, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { openDatabaseAsync } from 'expo-sqlite';
import { inicializarBanco } from './src/infrastructure/database';
import { OrdemServicoRepository } from './src/infrastructure/OrdemServicoRepository';
import { Button, colors, styles } from './src/presentation/components/ui';

let bancoPromise;
function prepararBanco() {
  if (!bancoPromise) bancoPromise = openDatabaseAsync('gama-tecnico.db').then(async db => {
    await inicializarBanco(db); return db;
  }).catch(error => { bancoPromise = null; throw error; });
  return bancoPromise;
}
export default function App() {
  const [db, setDb] = useState(null);
  const [error, setError] = useState(false);
  const [logado, setLogado] = useState(false);
  const repositorio = useMemo(() => db ? new OrdemServicoRepository(db) : null, [db]);
  async function iniciar() {
    setError(false);
    try { setDb(await prepararBanco()); } catch { setError(true); }
  }
  useEffect(() => { iniciar(); }, []);
  return <SafeAreaProvider><StatusBar barStyle="dark-content" />
    {!db ? <SafeAreaView style={[styles.page, styles.content]}><Text style={styles.title}>GaMa Mobile</Text>
      {error ? <><Text style={styles.error}>Não foi possível preparar o banco local.</Text><Button title="Tentar novamente" onPress={iniciar} /></> : <ActivityIndicator color={colors.teal} />}
    </SafeAreaView> : <AppNavigator logado={logado} setLogado={setLogado} repositorio={repositorio} />}
  </SafeAreaProvider>;
}
