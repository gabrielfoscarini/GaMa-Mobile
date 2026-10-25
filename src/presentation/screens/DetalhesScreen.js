import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { usePreventRemove } from '@react-navigation/native';
import { concluirOrdem, iniciarOrdem, obterOrdem, salvarExecucao } from '../../application/ordens';
import { OrdemServico, SITUACOES } from '../../domain/OrdemServico';
import { Badge, Button, Feedback, Field, formatDate, styles } from '../components/ui';

export default function DetalhesScreen({ route, navigation, repositorio }) {
  const [ordem, setOrdem] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  usePreventRemove(dirty || busy, ({ data }) => {
    if (busy) return;
    Alert.alert('Alterações não salvas', 'Deseja sair e descartar as alterações?', [
      { text: 'Continuar editando', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: () => navigation.dispatch(data.action) },
    ]);
  });
  async function carregar() {
    setError('');
    try { setOrdem(await obterOrdem(repositorio, route.params.id)); }
    catch { setError('Não foi possível abrir esta ordem. Tente novamente.'); }
  }
  useEffect(() => { carregar(); }, [route.params.id]);
  function alterar(campo, valor) { setDirty(true); setOrdem(atual => ({ ...atual, [campo]: valor })); }
  async function executar(acao, mensagem) {
    if (busy) return;
    setBusy(true); setError('');
    try {
      await acao();
      setDirty(false);
      setOrdem(await obterOrdem(repositorio, ordem.id));
      Alert.alert('GaMa Mobile', mensagem);
    } catch (e) { setError(e.message || 'Não foi possível salvar. Tente novamente.'); }
    finally { setBusy(false); }
  }
  function confirmarConclusao() {
    try { new OrdemServico(ordem).validarConclusao(ordem); }
    catch (e) { setError(e.message); return; }
    Alert.alert('Concluir esta OS?', 'Os dados serão salvos e a ordem ficará disponível somente para consulta.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Concluir OS', onPress: () => executar(() => concluirOrdem(repositorio, ordem.id, ordem), 'Ordem concluída e salva no histórico.') },
    ]);
  }
  if (!ordem) return <View style={[styles.page, styles.content]}><Feedback error={error} />{error ? <Button title="Tentar novamente" onPress={carregar} /> : <ActivityIndicator color="#006B61" />}</View>;
  const editavel = ordem.status === 'Em andamento';
  const info = [['Cliente', ordem.cliente], ['Veículo', ordem.veiculo], ['Placa', ordem.placa], ['Quilometragem', `${ordem.quilometragem.toLocaleString('pt-BR')} km`],
    ['Reclamação do cliente', ordem.reclamacao], ['Serviço solicitado', ordem.servico_solicitado], ['Mecânico', ordem.tecnico],
    ['Abertura', formatDate(ordem.data_abertura)], ['Início', formatDate(ordem.data_inicio)], ['Conclusão', formatDate(ordem.data_conclusao)]];
  return <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      <Text style={styles.title}>OS #{ordem.numero}</Text><Badge status={ordem.status} />
      <Text style={styles.muted}>{ordem.status === 'Concluída' ? 'Atendimento encerrado • Somente consulta' : editavel ? 'Registre a execução e salve antes de sair.' : 'Inicie o atendimento para preencher a execução.'}</Text>
      <View style={styles.card}>{info.map(([label, value]) => <View key={label}><Text style={styles.muted}>{label}</Text><Text style={styles.text}>{value}</Text></View>)}</View>
      {ordem.status === 'Pendente' && <Button title="Iniciar atendimento" busy={busy} onPress={() => executar(() => iniciarOrdem(repositorio, ordem.id), 'Atendimento iniciado.')} />}
      <View style={styles.card}>
        <Text style={styles.heading}>Registro do atendimento</Text>
        {[['diagnostico', 'Diagnóstico *'], ['servico_realizado', 'Serviço realizado *'], ['pecas_utilizadas', 'Peças utilizadas'], ['observacoes', 'Observações']].map(([key, label]) =>
          editavel ? <Field key={key} label={label} multiline value={ordem[key]} editable={!busy} onChangeText={value => alterar(key, value)} /> :
            <View key={key}><Text style={styles.label}>{label}</Text><Text style={styles.text}>{ordem[key] || 'Não informado'}</Text></View>)}
        {editavel && <Text style={styles.muted}>* Obrigatório para concluir. Você pode salvar um registro parcial.</Text>}
      </View>
      <View style={styles.card}><Text style={styles.heading}>Checklist de inspeção</Text>
        {ordem.checklist.map(item => <View key={item.id} style={{ gap: 8, paddingVertical: 8 }}>
          <Text style={styles.label}>{item.nome_item}</Text>
          {editavel ? <View style={{ gap: 6 }}>{SITUACOES.map(situacao => {
            const selected = item.situacao === situacao;
            return <Pressable key={situacao} accessibilityRole="radio" accessibilityLabel={`${item.nome_item}: ${situacao}`} accessibilityState={{ checked: selected, disabled: busy }} disabled={busy}
              onPress={() => alterar('checklist', ordem.checklist.map(i => i.id === item.id ? { ...i, situacao } : i))}
              style={{ minHeight: 46, padding: 12, borderRadius: 9, borderWidth: 1, borderColor: selected ? '#006B61' : '#D8E1E3', backgroundColor: selected ? '#E2EEEB' : '#FFFFFF' }}>
              <Text style={{ color: selected ? '#006B61' : '#546973', fontWeight: selected ? '700' : '400' }}>{selected ? '●' : '○'} {situacao}</Text>
            </Pressable>;
          })}</View> : <Text style={styles.text}>{item.situacao}</Text>}
        </View>)}
      </View>
      <Feedback error={error} />
      {editavel && <><Button secondary title={dirty ? 'Salvar alterações' : 'Salvar registro'} busy={busy} onPress={() => executar(() => salvarExecucao(repositorio, ordem.id, ordem), 'Registro salvo no aparelho.')} />
        <Button title="Concluir OS" disabled={busy} onPress={confirmarConclusao} /></>}
    </ScrollView>
  </KeyboardAvoidingView>;
}
