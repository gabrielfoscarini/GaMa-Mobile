import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listarOrdens } from '../../application/ordens';
import { STATUS } from '../../domain/OrdemServico';
import { Badge, Button, Feedback, Field, styles } from '../components/ui';

export default function OrdensScreen({ navigation, repositorio, historico = false }) {
  const [busca, setBusca] = useState('');
  const [situacao, setSituacao] = useState(STATUS.PENDENTE);
  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const versao = useRef(0);
  useFocusEffect(useCallback(() => {
    const atual = ++versao.current;
    setLoading(true); setError('');
    listarOrdens(repositorio, busca, historico).then(dados => {
      if (atual === versao.current) setOrdens(dados);
    }).catch(() => { if (atual === versao.current) setError('Não foi possível carregar as ordens. Tente novamente.'); })
      .finally(() => { if (atual === versao.current) setLoading(false); });
    return () => { versao.current++; };
  }, [repositorio, busca, historico, tentativa]));
  const ordensVisiveis = historico ? ordens : ordens.filter(ordem => ordem.status === situacao);
  const filtros = [
    [STATUS.PENDENTE, 'Pendentes'],
    [STATUS.ANDAMENTO, 'Em andamento'],
    [STATUS.CONCLUIDA, 'Concluídas'],
  ];
  return <View style={styles.page}>
    <FlatList data={loading || error ? [] : ordensVisiveis} keyExtractor={item => String(item.id)} contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled" ListHeaderComponent={<View style={{ gap: 14 }}>
        <Text style={styles.muted}>GAMA MOBILE / {historico ? 'ARQUIVO' : 'ATENDIMENTOS'}</Text>
        <Text style={styles.title}>{historico ? 'Histórico' : 'Ordens de serviço'}</Text>
        <Text style={styles.muted}>{historico ? 'Serviços concluídos, disponíveis para consulta.' : 'Consulte as ordens e acompanhe cada atendimento.'}</Text>
        {!historico && <Button secondary title="Consultar histórico" onPress={() => navigation.navigate('Historico')} />}
        {!historico && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {filtros.map(([status, label]) => {
            const selecionado = situacao === status;
            return <Pressable key={status} accessibilityRole="button" accessibilityState={{ selected: selecionado }}
              onPress={() => setSituacao(status)}
              style={({ pressed }) => ({ minHeight: 48, paddingHorizontal: 12, paddingVertical: 14,
                justifyContent: 'center', borderRadius: 12, borderWidth: 1,
                borderColor: selecionado ? '#006B61' : '#9CACB2',
                backgroundColor: selecionado ? '#006B61' : '#FFFFFF', opacity: pressed ? 0.8 : 1 })}>
              <Text style={{ color: selecionado ? '#FFFFFF' : '#162C35', fontSize: 14, fontWeight: '700' }}>{label}</Text>
            </Pressable>;
          })}
        </View>}
        <Field label="Pesquisar OS ou placa" value={busca} onChangeText={setBusca} placeholder="Ex.: 1001 ou FIC1A01" autoCorrect={false} />
        <Feedback error={error} />
        {error ? <Button title="Tentar novamente" onPress={() => setTentativa(v => v + 1)} /> : null}
        {loading ? <ActivityIndicator color="#006B61" /> : !error && <Text style={styles.muted}>{ordensVisiveis.length} ordem(ns) encontrada(s)</Text>}
      </View>}
      ListEmptyComponent={!loading && !error ? <View style={styles.card}><Text style={styles.heading}>Nenhuma ordem encontrada</Text><Text style={styles.muted}>{historico ? 'Confira a busca ou conclua um atendimento.' : 'Nenhuma OS nesta situação corresponde à busca. Confira o número ou placa, ou escolha outra situação.'}</Text></View> : null}
      renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={`Abrir OS ${item.numero}, ${item.status}`}
        onPress={() => navigation.navigate('Detalhes', { id: item.id })} style={({ pressed }) => [styles.card, { opacity: pressed ? 0.75 : 1 }]}>
        <View style={styles.row}><Text style={styles.heading}>OS #{item.numero}</Text><Badge status={item.status} /></View>
        <Text style={styles.text}>{item.veiculo}</Text>
        <Text style={styles.muted}>{item.placa} • {item.cliente}</Text>
        <Text style={styles.text}>{item.servico_solicitado}</Text>
        <Text style={{ color: '#006B61', fontWeight: '700' }}>Ver atendimento →</Text>
      </Pressable>} />
  </View>;
}
