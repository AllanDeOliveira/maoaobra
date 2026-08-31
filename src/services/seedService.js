// src/services/seedService.js — Dados padrão e rotina de carga inicial (seed) para o Firebase
import { db } from '../firebase';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';

export const INITIAL_USERS = [
  { id: 'a1', nome: 'Administrador', email: 'legalmano@gmail.com', role: 'ADMIN', foto_perfil_url: 'https://ui-avatars.com/api/?name=Admin&background=ea1d2c&color=fff', telefone: '(11) 99999-0000', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'w1', nome: 'Eduardo Eletricista', email: 'eduardo@gmail.com', role: 'TRABALHADOR', foto_perfil_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop', telefone: '(11) 98888-7777', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'w2', nome: 'Mario Encanador', email: 'encanador@gmail.com', role: 'TRABALHADOR', foto_perfil_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=400&fit=crop', telefone: '(11) 97777-6666', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'w3', nome: 'Maria Diarista', email: 'diarista@gmail.com', role: 'TRABALHADOR', foto_perfil_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop', telefone: '(11) 96666-5555', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'w4', nome: 'Pablo Pintor', email: 'pintor@gmail.com', role: 'TRABALHADOR', foto_perfil_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop', telefone: '(11) 95555-4444', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'w5', nome: 'Tiago Montador', email: 'montador@gmail.com', role: 'TRABALHADOR', foto_perfil_url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop', telefone: '(11) 94444-3333', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'w6', nome: 'Carlos TI', email: 'ti@gmail.com', role: 'TRABALHADOR', foto_perfil_url: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop', telefone: '(11) 93333-2222', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'w7', nome: 'Roberto Fretes', email: 'frete@gmail.com', role: 'TRABALHADOR', foto_perfil_url: 'https://images.unsplash.com/photo-1581574919402-5b7d733224d6?w=400&h=400&fit=crop', telefone: '(11) 92222-1111', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'w8', nome: 'Felipe Eletricista', email: 'felipe@gmail.com', role: 'TRABALHADOR', foto_perfil_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop', telefone: '(11) 91111-0000', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'w9', nome: 'Ana Diarista', email: 'ana@gmail.com', role: 'TRABALHADOR', foto_perfil_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=400&fit=crop', telefone: '(11) 90000-9999', data_criacao: new Date().toISOString(), status: 'APPROVED' },
  { id: 'c1', nome: 'Pedro Cliente', email: 'pedro@gmail.com', role: 'CONTRATANTE', foto_perfil_url: 'https://ui-avatars.com/api/?name=Pedro+Cliente&background=ea1d2c&color=fff', telefone: '(11) 98765-4321', data_criacao: new Date().toISOString(), status: 'APPROVED' }
];

export const INITIAL_WORKER_DETAILS = [
  { id: 'w1', user_id: 'w1', bio: 'Especialista em instalações residenciais.', categorias: ['Eletricista'], nota_media: 4.9, portfolio_fotos: [], cpf: '123.456.789-00', cep: '78200-000', rua: 'Rua Principal', numero: '100', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sex, 08:00 às 18:00', horaInicio: '08:00', horaFim: '18:00' },
  { id: 'w2', user_id: 'w2', bio: 'Resolvo vazamentos rapidamente.', categorias: ['Encanador'], nota_media: 4.8, portfolio_fotos: [], cpf: '223.456.789-00', cep: '78200-000', rua: 'Rua das Águas', numero: '200', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sex, 08:00 às 18:00', horaInicio: '08:00', horaFim: '18:00' },
  { id: 'w3', user_id: 'w3', bio: 'Faxina completa e caprichosa.', categorias: ['Diarista'], nota_media: 5.0, portfolio_fotos: [], cpf: '323.456.789-00', cep: '78200-000', rua: 'Rua da Limpeza', numero: '300', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sab, 07:00 às 17:00', horaInicio: '07:00', horaFim: '17:00' },
  { id: 'w4', user_id: 'w4', bio: 'Pintura lisa e texturas.', categorias: ['Pintor'], nota_media: 4.7, portfolio_fotos: [], cpf: '423.456.789-00', cep: '78200-000', rua: 'Avenida das Cores', numero: '400', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sex, 08:00 às 18:00', horaInicio: '08:00', horaFim: '18:00' },
  { id: 'w5', user_id: 'w5', bio: 'Montagem de móveis novos e usados com perfeição.', categorias: ['Montador'], nota_media: 4.8, portfolio_fotos: [], cpf: '523.456.789-00', cep: '78200-000', rua: 'Rua dos Móveis', numero: '500', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sab, 08:00 às 18:00', horaInicio: '08:00', horaFim: '18:00' },
  { id: 'w6', user_id: 'w6', bio: 'Assistência técnica em computadores e redes.', categorias: ['TI'], nota_media: 4.9, portfolio_fotos: [], cpf: '623.456.789-00', cep: '78200-000', rua: 'Rua dos Bits', numero: '600', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sex, 09:00 às 19:00', horaInicio: '09:00', horaFim: '19:00' },
  { id: 'w7', user_id: 'w7', bio: 'Mudanças e fretes para toda a região.', categorias: ['Freteiro'], nota_media: 4.6, portfolio_fotos: [], cpf: '723.456.789-00', cep: '78200-000', rua: 'Avenida do Transporte', numero: '700', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Dom-Dom, 06:00 às 20:00', horaInicio: '06:00', horaFim: '20:00' },
  { id: 'w8', user_id: 'w8', bio: 'Instalações elétricas seguras e eficientes.', categorias: ['Eletricista'], nota_media: 4.8, portfolio_fotos: [], cpf: '823.456.789-00', cep: '78200-000', rua: 'Rua da Energia', numero: '800', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sab, 07:00 às 17:00', horaInicio: '07:00', horaFim: '17:00' },
  { id: 'w9', user_id: 'w9', bio: 'Cuidado especial com suas roupas e móveis.', categorias: ['Diarista'], nota_media: 4.9, portfolio_fotos: [], cpf: '923.456.789-00', cep: '78200-000', rua: 'Avenida da Limpeza', numero: '900', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', isOnline: true, workingHours: 'Seg-Sex, 08:00 às 18:00', horaInicio: '08:00', horaFim: '18:00' },
];

export const INITIAL_CLIENT_DETAILS = [
  { id: 'c1', user_id: 'c1', cpf: '000.111.222-33', cep: '78200-000', rua: 'Rua das Palmeiras', numero: '50', bairro: 'Centro', uf: 'MT', cidade: 'Cáceres', total_pedidos: 1 }
];

export const INITIAL_SERVICES = [
  { id: 's1', worker_id: 'w1', titulo: 'Instalação de Tomadas e Disjuntores', preco_base: 80, descricao: 'Serviço rápido e seguro para sua residência.', imagem_url: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=500&h=300&fit=crop' },
  { id: 's2', worker_id: 'w1', titulo: 'Troca de Fiação Completa', preco_base: 450, descricao: 'Revisão e troca de fiação antiga para evitar curtos.', imagem_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&h=300&fit=crop' },
  { id: 's3', worker_id: 'w2', titulo: 'Conserto de Vazamentos', preco_base: 100, descricao: 'Identificação e conserto de vazamentos em canos de PVC.', imagem_url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&h=300&fit=crop' },
  { id: 's4', worker_id: 'w2', titulo: 'Instalação de Pias e Vasos', preco_base: 150, descricao: 'Instalação completa de louças sanitárias.', imagem_url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=500&h=300&fit=crop' },
  { id: 's5', worker_id: 'w3', titulo: 'Faxina Residencial Completa', preco_base: 180, descricao: 'Limpeza pesada incluindo banheiros, vidros e chão.', imagem_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&h=300&fit=crop' },
  { id: 's6', worker_id: 'w3', titulo: 'Limpeza Pós-Obra', preco_base: 250, descricao: 'Remoção de entulhos leves, pó de gesso e cimento.', imagem_url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500&h=300&fit=crop' },
  { id: 's7', worker_id: 'w4', titulo: 'Pintura Residencial (Cômodo)', preco_base: 300, descricao: 'Pintura de até 15m² incluindo preparo da parede.', imagem_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&h=300&fit=crop' },
  { id: 's8', worker_id: 'w4', titulo: 'Aplicação de Textura', preco_base: 400, descricao: 'Texturização decorativa para paredes internas.', imagem_url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=500&h=300&fit=crop' },
  { id: 's9', worker_id: 'w5', titulo: 'Montagem de Guarda-Roupa', preco_base: 120, descricao: 'Montagem de guarda-roupas de 2 a 6 portas.', imagem_url: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=500&h=300&fit=crop' },
  { id: 's10', worker_id: 'w5', titulo: 'Montagem de Painel de TV', preco_base: 90, descricao: 'Instalação de painel de TV e suporte na parede.', imagem_url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&h=300&fit=crop' },
  { id: 's11', worker_id: 'w6', titulo: 'Formatação de Computador', preco_base: 100, descricao: 'Formatação, instalação do Windows e backup de arquivos.', imagem_url: 'https://images.unsplash.com/photo-1593642702821-c823b13eb295?w=500&h=300&fit=crop' },
  { id: 's12', worker_id: 'w6', titulo: 'Configuração de Roteador Wi-Fi', preco_base: 80, descricao: 'Instalação e configuração de repetidores e redes.', imagem_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&h=300&fit=crop' },
  { id: 's13', worker_id: 'w7', titulo: 'Frete Municipal (Pequeno)', preco_base: 150, descricao: 'Transporte de móveis e eletrodomésticos dentro de Cáceres.', imagem_url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&h=300&fit=crop' },
  { id: 's14', worker_id: 'w7', titulo: 'Mudança Completa Residencial', preco_base: 450, descricao: 'Caminhão baú grande para mudança completa.', imagem_url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500&h=300&fit=crop' },
  { id: 's15', worker_id: 'w8', titulo: 'Instalação de Ventilador de Teto', preco_base: 120, descricao: 'Instalação segura com balanceamento perfeito.', imagem_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&h=300&fit=crop' },
  { id: 's16', worker_id: 'w8', titulo: 'Revisão de Quadro Elétrico', preco_base: 250, descricao: 'Verificação de disjuntores e balanceamento de carga.', imagem_url: 'https://images.unsplash.com/photo-1622322695503-490325492d37?w=500&h=300&fit=crop' },
  { id: 's17', worker_id: 'w9', titulo: 'Passar Roupas', preco_base: 100, descricao: 'Passadoria de roupas do dia a dia e sociais.', imagem_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&h=300&fit=crop' },
  { id: 's18', worker_id: 'w9', titulo: 'Limpeza de Estofados', preco_base: 150, descricao: 'Limpeza a seco para sofás e cadeiras estofadas.', imagem_url: 'https://images.unsplash.com/photo-1605342416281-799f928cddbd?w=500&h=300&fit=crop' },
];

/**
 * Realiza o seed inicial no Firestore se o catálogo de serviços ou usuários estiver vazio.
 */
export async function seedFirestoreIfEmpty() {
  try {
    const servicesSnap = await getDocs(collection(db, 'services'));
    if (!servicesSnap.empty) return; // Já foi populado anteriormente

    console.log('⚡ Populando Firestore com dados iniciais (Seed)...');

    for (const u of INITIAL_USERS) {
      await setDoc(doc(db, 'users', u.id), u);
    }
    for (const w of INITIAL_WORKER_DETAILS) {
      await setDoc(doc(db, 'workers', w.id), w);
    }
    for (const c of INITIAL_CLIENT_DETAILS) {
      await setDoc(doc(db, 'clients', c.id), c);
    }
    for (const s of INITIAL_SERVICES) {
      await setDoc(doc(db, 'services', s.id), s);
    }
    console.log('✅ Firestore populado com sucesso!');
  } catch (err) {
    console.warn('Seed não pôde ser executado ou já inicializado:', err.message);
  }
}
