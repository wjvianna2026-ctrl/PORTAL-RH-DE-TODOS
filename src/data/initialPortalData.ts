import {
  CollaboratorProfile,
  ImageAdaptationSettings,
  PortalData,
  RankingEntry,
} from '../types/portal';

export const DEFAULT_IMAGE_SETTINGS: ImageAdaptationSettings = {
  bannerAspectRatio: '16:9',
  fitMode: 'blur-backdrop',
  qualityPreset: 'balanced',
  roundedStyle: 'lg',
  goldBorder: true,
  autoAdaptUploads: true,
};

export const GENERATED_ASSETS = {
  heroTower: '/src/assets/images/hero_signature_tower_1795629924873.jpg',
  auroraTower: '/src/assets/images/comunicado_residencial_aurora_1795629924286.jpg',
  safetySite: '/src/assets/images/comunicado_seguranca_obra_1795629924577.jpg',
  avatar1: '/src/assets/images/avatar_colaborador_1_1795629924319.jpg',
  avatar2: '/src/assets/images/avatar_colaborador_2_1795629925418.jpg',
  avatar3: '/src/assets/images/avatar_colaborador_3_1795629925432.jpg',
};

export const ATTACHED_ASSETS = {
  officialLogo: '/assets/aistudio/PORTAL_RH_-_LOGO_C_R_eb82e443.jpg',
  hrRegistrationGuide: '/assets/aistudio/PORTAL_RH_-_Cadastro_no_sistema_de_RH_-_Passo_a_Passo_fc984600.jpeg',
  endomarketingPdf: '/assets/aistudio/PORTAL_RH_-_Apresentacao_Endomarketing_576c75fc.pdf',
  codeOfConductPdf: '/assets/aistudio/PORTAL_RH_-_CR_Codigo_de_Conduta_e_Etica_2448ff7d.pdf',
  birthdaysMantaPdf: '/assets/aistudio/PORTAL_-_Manta_-_Empregados_Aniversariantes_do_M_s_08aff80b.pdf',
  birthdaysMatrizPdf: '/assets/aistudio/PORTAL_-_Matriz_-_Empregados_Aniversariantes_do_M_s_b1d8f7b8.pdf',
  birthdaysWatalPdf: '/assets/aistudio/PORTAL_-_Watal_-_Empregados_Aniversariantes_do_M_s_1704971a.pdf',
};

export const INITIAL_COLLABORATOR_PROFILE: CollaboratorProfile = {
  name: 'Marina Vasconcelos',
  role: 'Arquiteta de Coordenação',
  sectorOrSite: 'Manta - Cavalcante e Rolim Design SPE',
  photoUrl: GENERATED_ASSETS.avatar2,
  points: 460,
  dailyLoginClaimed: false,
  readAnnouncementIds: [],
  completedManualIds: [],
  completedOnboardingIds: ['onb-1', 'onb-2'],
  congratulatedBirthdayIds: [],
  completedChallengeIds: [],
  reactedAnnouncementIds: [],
  activityLog: [
    {
      id: 'act-init-1',
      label: 'Conclusão dos módulos iniciais de Cultura Signature',
      points: 150,
      timestamp: 'Esta semana',
    },
    {
      id: 'act-init-2',
      label: 'Leitura e desafio de Segurança NR-18',
      points: 125,
      timestamp: 'Há 3 dias',
    },
    {
      id: 'act-init-3',
      label: 'Engajamento mensal e metas de equipe',
      points: 185,
      timestamp: 'Este mês',
    },
  ],
};

export const INITIAL_RANKING_PEERS: RankingEntry[] = [
  {
    id: 'rank-1',
    name: 'Ronaldo Santos Canuto',
    role: 'Engenheiro Civil',
    sectorOrSite: 'Manta - Cavalcante e Rolim Design SPE',
    photoUrl: GENERATED_ASSETS.avatar1,
    points: 940,
  },
  {
    id: 'rank-2',
    name: 'Adeilton Antonio da Silva Santos Filho',
    role: 'Encarregado de Manutenção',
    sectorOrSite: 'Watal Patacho Eco Boutique Residence SPE',
    photoUrl: GENERATED_ASSETS.avatar3,
    points: 865,
  },
  {
    id: 'rank-3',
    name: 'Willian Vianna',
    role: 'Responsável pelo Setor de RH',
    sectorOrSite: 'Matriz - Cavalcante e Rolim Empreendimentos',
    photoUrl: GENERATED_ASSETS.avatar3,
    points: 790,
  },
  {
    id: 'rank-4',
    name: 'Beatriz Monteiro',
    role: 'Analista de Suprimentos Sênior',
    sectorOrSite: 'Matriz - Cavalcante e Rolim Empreendimentos',
    photoUrl: GENERATED_ASSETS.avatar2,
    points: 710,
  },
  {
    id: 'rank-5',
    name: 'Luiz Farias Costa Neto',
    role: 'Pedreiro',
    sectorOrSite: 'Watal Patacho Eco Boutique Residence SPE',
    photoUrl: GENERATED_ASSETS.avatar1,
    points: 645,
  },
  {
    id: 'rank-6',
    name: 'Lucas Augusto de Gusmão Lima',
    role: 'Servente de Pedreiro',
    sectorOrSite: 'Manta - Cavalcante e Rolim Design SPE',
    photoUrl: GENERATED_ASSETS.avatar1,
    points: 580,
  },
  {
    id: 'rank-7',
    name: 'Aline Patricia Ferreira Nunes',
    role: 'Serviços Gerais',
    sectorOrSite: 'Matriz - Cavalcante e Rolim Empreendimentos',
    photoUrl: GENERATED_ASSETS.avatar2,
    points: 525,
  },
  {
    id: 'rank-8',
    name: 'Felipe Sebastião da Silva Santos',
    role: 'Servente de Pedreiro',
    sectorOrSite: 'Manta - Cavalcante e Rolim Design SPE',
    photoUrl: GENERATED_ASSETS.avatar3,
    points: 440,
  },
  {
    id: 'rank-9',
    name: 'João Paulo dos Santos Nascimento',
    role: 'Ajudante Prático',
    sectorOrSite: 'Watal Patacho Eco Boutique Residence SPE',
    photoUrl: GENERATED_ASSETS.avatar1,
    points: 390,
  },
  {
    id: 'rank-10',
    name: 'José Edson Teixeira',
    role: 'Pedreiro',
    sectorOrSite: 'Watal Patacho Eco Boutique Residence SPE',
    photoUrl: GENERATED_ASSETS.avatar3,
    points: 345,
  },
];

export const INITIAL_PORTAL_DATA: PortalData = {
  brand: {
    companyName: 'Cavalcante & Rolim',
    tagline: 'Signature Spaces',
    customLogoUrl: ATTACHED_ASSETS.officialLogo,
    heroImage: GENERATED_ASSETS.heroTower,
    heroHeadline: 'Construímos espaços que traduzem excelência silenciosa e rigor arquitetônico.',
    heroSubheadline:
      'Portal Oficial de Pessoas, Cultura e Endomarketing da Cavalcante & Rolim Empreendimentos. Mais de 25 anos no mercado imobiliário alagoano e referência de alto padrão na Rota Ecológica dos Milagres/AL.',
    imageSettings: DEFAULT_IMAGE_SETTINGS,
  },
  projects: [
    {
      id: 'proj-manta',
      name: 'Manta - Cavalcante e Rolim Design SPE',
      location: 'Rota Ecológica dos Milagres · AL',
      phase: 'Estrutura & Acabamento Signature',
      progress: 72,
      engineer: 'Eng. Ronaldo Santos Canuto',
      deliveryForecast: 'Novembro 2027',
      safetyDaysWithoutAccidents: 318,
      status: 'Em Execução',
    },
    {
      id: 'proj-watal',
      name: 'Watal Patacho Eco Boutique Residence SPE',
      location: 'Praia do Patacho · Porto de Pedras/AL',
      phase: 'Alvenaria, Instalações & Fachada Eco',
      progress: 64,
      engineer: 'Enc. Adeilton Antonio da Silva',
      deliveryForecast: 'Abril 2028',
      safetyDaysWithoutAccidents: 274,
      status: 'Em Execução',
    },
    {
      id: 'proj-matriz',
      name: 'Matriz - Cavalcante e Rolim Empreendimentos',
      location: 'Maceió · AL',
      phase: 'Sede Administrativa & Gestão Corporativa',
      progress: 100,
      engineer: 'Diretoria & Gestão de Pessoas',
      deliveryForecast: 'Operação Contínua',
      safetyDaysWithoutAccidents: 620,
      status: 'Entregue',
    },
    {
      id: 'proj-aurora',
      name: 'Residencial Aurora Signature',
      location: 'Ponta Verde · Maceió/AL',
      phase: 'Fachada em Travertino & Esquadrias',
      progress: 84,
      engineer: 'Eng. Rafael Alencar',
      deliveryForecast: 'Outubro 2027',
      safetyDaysWithoutAccidents: 412,
      status: 'Acabamento',
    },
  ],
  announcements: [
    {
      id: 'com-endo-2026',
      title: 'Plano de Endomarketing 2º Semestre 2026: Duas Frentes, Um Só Propósito',
      category: 'Institucional',
      summary:
        'Conheça os 5 pilares de atuação para Escritório e Obra, o Prêmio Capacete de Ouro CR, a Trilha de Crescimento CR e o calendário oficial de ações até dezembro.',
      coverImage: GENERATED_ASSETS.auroraTower,
      author: 'Recursos Humanos · Willian Vianna',
      publishedAt: '25 Nov 2026',
      views: 198,
      reactions: { applause: 54, insightful: 31, important: 48 },
      originalPdfUrl: ATTACHED_ASSETS.endomarketingPdf,
      originalFileName: 'PORTAL_RH_Apresentacao_Endomarketing_2026.pdf',
      sections: [
        {
          id: 'endo-1',
          heading: '01. Contexto e Cinco Pilares (Escritório e Obra)',
          content:
            'O Plano de Endomarketing cobre os dois públicos internos da Cavalcante & Rolim com abordagens sob medida: Escritório (até 20 colaboradores, com ações de alto-toque como Destaque do Mês, Café com a Diretoria, Almoço de Equipe e Pesquisa de Clima) e Obra (cerca de 200 colaboradores, com ações recorrentes apoiadas em rituais como o DDS Turbinado, Mural da Obra, Lanche Reforçado e Kit de Calor). Os cinco pilares são: 01. Cultura, 02. Reconhecimento, 03. Comunicação, 04. Segurança e 05. Retenção.',
        },
        {
          id: 'endo-2',
          heading: '02. Prêmio Capacete de Ouro CR',
          content:
            'Programa mensal de valorização nos canteiros avaliado pelos encarregados através de checklist objetivo em 4 critérios: Segurança (uso correto de EPIs e zelo pelas normas), Comportamento (pontualidade, assiduidade e disciplina), Trabalho em Equipe (bom relacionamento e proatividade) e Qualidade & Produtividade. O vencedor é anunciado no DDS do 1º dia útil do mês seguinte, ganha foto no mural da obra, capacete dourado comemorativo, prioridade no refeitório/vestiário e vale-compra ou lanche especial.',
        },
        {
          id: 'endo-3',
          heading: '03. Trilha de Crescimento CR & Ações Estruturantes',
          content:
            'Critérios transparentes de progressão na obra a partir do histórico do Capacete de Ouro: 1. Servente -> 2. Oficial (3+ avaliações consistentes) -> 3. Encarregado de Frente (boas notas em equipe + indicação + vaga) -> 4. Mestre de Obras (histórico consistente + validação da engenharia). Complementam o plano: Marcos da Obra, Programa Indique um Colega (bônus após retenção de 90 dias), Kit de Boas-Vindas (capacete com nome, camiseta/boné CR e cartilha), Reconhecimento por Tempo de Casa (1, 3 e 5 anos) e o horizonte 2027 da Escola CR em parceria com SENAI/SESI.',
        },
      ],
      challenge: {
        id: 'chal-endo-2026',
        title: 'Desafio Endomarketing: Capacete de Ouro & Trilha CR',
        type: 'multiple_choice',
        questions: [
          {
            id: 'q-endo-1',
            prompt: 'Quais são os 4 critérios avaliados mensalmente no Prêmio Capacete de Ouro CR?',
            options: [
              'Apenas velocidade de entrega e horas extras',
              'Segurança, Comportamento, Trabalho em Equipe e Qualidade/Produtividade',
              'Tempo de empresa e formação universitária',
              'Indicação de colegas e presença em eventos',
            ],
            correctIndex: 1,
            explanation:
              'O Capacete de Ouro CR avalia Segurança (EPIs), Comportamento (pontualidade/disciplina), Trabalho em Equipe e Qualidade/Produtividade.',
          },
          {
            id: 'q-endo-2',
            prompt: 'Na Trilha de Crescimento CR, qual é a sequência correta de evolução na obra?',
            options: [
              'Servente → Oficial → Encarregado de Frente → Mestre de Obras',
              'Ajudante → Supervisor → Diretor Técnico',
              'Oficial → Servente → Mestre de Obras',
            ],
            correctIndex: 0,
            explanation:
              'A Trilha de Crescimento CR estrutura a evolução de Servente para Oficial, depois Encarregado de Frente e Mestre de Obras.',
          },
          {
            id: 'q-endo-3',
            prompt: 'No programa Indique um Colega, quando o colaborador indicador recebe o bônus?',
            options: [
              'No dia do envio do currículo',
              'Se o indicado for contratado e retido além do período de experiência (~90 dias)',
              'Apenas após 2 anos de empresa',
            ],
            correctIndex: 1,
            explanation:
              'O bônus é concedido quando o candidato indicado é contratado e permanece após o período de experiência (~90 dias).',
          },
        ],
      },
    },
    {
      id: 'com-cadastro-rh',
      title: 'Indique um Colega: Passo a Passo do Cadastro de Currículo no Sistema de RH',
      category: 'Eventos',
      summary:
        'Veja o guia visual completo em 6 passos para orientar profissionais indicados a cadastrar o currículo corretamente e concorrer ao bônus de indicação.',
      coverImage: GENERATED_ASSETS.safetySite,
      author: 'Recursos Humanos · Recrutamento & Seleção',
      publishedAt: '24 Nov 2026',
      views: 162,
      reactions: { applause: 39, insightful: 41, important: 35 },
      embeddedGuideImage: ATTACHED_ASSETS.hrRegistrationGuide,
      sections: [
        {
          id: 'cad-1',
          heading: 'Passo a Passo Oficial para Cadastro no Sistema',
          content:
            'Compartilhe este fluxo com colegas, familiares e profissionais qualificados que desejam integrar as equipes da Cavalcante & Rolim:\n\n1. Acesse o Site: Entre em www.institutoeudnatizeu.com.br (ou leia o QR Code no guia visual abaixo; no celular, acesse o menu lateral).\n2. Faça seu Cadastro: Clique no botão "Cadastre-se".\n3. Complete seus Dados Pessoais: Preencha todos os dados e carregue o arquivo em PDF do seu currículo.\n4. Escolha um Cargo Desejado: Selecionar o cargo aumenta suas chances nos filtros de busca de candidatos.\n5. Preencha os Dados de Acesso: Crie uma senha de login e clique em CADASTRAR.\n6. Pronto! Cadastro concluído para as próximas oportunidades.',
        },
        {
          id: 'cad-2',
          heading: 'Conexão com o Programa Indique um Colega',
          content:
            'Lembre o candidato de informar seu nome como indicador ao RH. Caso o profissional seja contratado e permaneça após os 90 dias de experiência, você recebe a bonificação prevista no Plano de Endomarketing C&R.',
        },
      ],
      challenge: {
        id: 'chal-cad-rh',
        title: 'Verificação Rápida: Cadastro de Talentos',
        type: 'true_false',
        questions: [
          {
            id: 'q-cad-1',
            prompt: 'Para aumentar as chances nos filtros de busca do sistema de RH, o candidato deve selecionar um cargo desejado e anexar o currículo em PDF.',
            options: ['Verdadeiro', 'Falso'],
            correctIndex: 0,
            explanation: 'Verdadeiro! O carregamento do PDF e a escolha do cargo desejado são etapas essenciais do passo a passo.',
          },
        ],
      },
    },
    {
      id: 'com-1',
      title: 'Canteiros Manta & Watal Patacho mantêm índice zero de acidentes no trimestre',
      category: 'Obras',
      summary:
        'As equipes de engenharia e campo celebram o avanço físico nas obras da Rota Ecológica dos Milagres e Patacho com adesão integral ao DDS Turbinado e NR-35.',
      coverImage: GENERATED_ASSETS.heroTower,
      author: 'Engenharia & SST C&R',
      publishedAt: '22 Nov 2026',
      views: 184,
      reactions: { applause: 42, insightful: 18, important: 29 },
      sections: [
        {
          id: 'sec-1-1',
          heading: 'Excelência Construtiva no Litoral Norte',
          content:
            'Os empreendimentos Manta (Cavalcante & Rolim Design SPE) e Watal Patacho Eco Boutique Residence alcançaram respectivamente 72% e 64% de execução física com alto rigor em acabamentos naturais e controle tecnológico.',
        },
        {
          id: 'sec-1-2',
          heading: 'Cultura de Segurança e DDS Turbinado',
          content:
            'O cumprimento rigoroso do uso de EPIs e dos diálogos semanais de segurança mantém nossas equipes protegidas e fortalece os critérios do Prêmio Capacete de Ouro CR.',
        },
      ],
      challenge: {
        id: 'chal-com-1',
        title: 'Desafio de Obra: Segurança & Qualidade',
        type: 'multiple_choice',
        questions: [
          {
            id: 'q-c1-1',
            prompt: 'Qual ritual semanal de obra foi integrado ao Plano de Endomarketing sem criar custo adicional?',
            options: [
              'DDS Turbinado',
              'Reunião externa bimestral',
              'Auditoria semestral terceirizada',
            ],
            correctIndex: 0,
            explanation: 'O DDS Turbinado aproveita o ritual já existente no canteiro com custo zero.',
          },
        ],
      },
    },
    {
      id: 'com-2',
      title: 'Atenção: Calendário de Dezembro — Dia do Pedreiro, Engenheiro e Confraternização',
      category: 'Urgente',
      summary:
        'Confira as datas especiais de dezembro no Escritório e na Obra: 11/12 (Dia do Engenheiro e Arquiteto), 13/12 (Dia do Pedreiro) e Confraternização de Fim de Ano.',
      coverImage: GENERATED_ASSETS.safetySite,
      author: 'Endomarketing & RH C&R',
      publishedAt: '20 Nov 2026',
      views: 231,
      reactions: { applause: 51, insightful: 24, important: 67 },
      sections: [
        {
          id: 'sec-2-1',
          heading: 'Datas Comemorativas de Dezembro',
          content:
            '11 de Dezembro: Dia do Engenheiro e Arquiteto (homenagem especial e entrega de brinde técnico na sede e obras).\n13 de Dezembro: Dia do Pedreiro (café especial, entrega de lembranças e homenagem no DDS).\nDezembro (Data a confirmar): Confraternização de Fim de Ano + Amigo Secreto do Escritório + Sorteio de brindes na Obra.',
        },
      ],
      challenge: {
        id: 'chal-com-2',
        title: 'Associação: Calendário C&R Dezembro',
        type: 'matching',
        questions: [],
        matchingPairs: [
          { id: 'mp-d1', term: '11 de Dezembro', definition: 'Dia do Engenheiro e do Arquiteto' },
          { id: 'mp-d2', term: '13 de Dezembro', definition: 'Dia do Pedreiro (frente Obra)' },
          { id: 'mp-d3', term: 'Aniversariantes do Mês', definition: 'Base fixa mensal tanto no Escritório quanto na Obra' },
        ],
      },
    },
  ],
  benefits: [
    {
      id: 'ben-1',
      title: 'Prêmio Capacete de Ouro CR',
      provider: 'Cavalcante & Rolim · Obra',
      eligibilityRegime: 'Obra',
      eligibilityTenure: 'Desde a Admissão',
      coverageSummary: 'Reconhecimento mensal com vale-compra/lanche especial + prioridade no refeitório e vestiário.',
      description:
        'Premia mensalmente os destaques de cada canteiro avaliados pelos encarregados em Segurança, Comportamento, Trabalho em Equipe e Qualidade. Contabiliza pontos para a Trilha de Crescimento CR.',
      howToRequest: 'Avaliação mensal automática pelos encarregados de frente e anúncio no DDS do 1º dia útil.',
    },
    {
      id: 'ben-2',
      title: 'Programa Indique um Colega',
      provider: 'Cavalcante & Rolim · RH',
      eligibilityRegime: 'Todos os Colaboradores',
      eligibilityTenure: 'Desde a Admissão',
      coverageSummary: 'Bonificação ao indicador quando o profissional contratado completa o período de experiência (~90 dias).',
      description:
        'Incentiva nossos colaboradores a indicarem profissionais confiáveis e qualificados para vagas abertas na sede ou nas obras.',
      howToRequest: 'Oriente o indicado a cadastrar o currículo conforme o Passo a Passo no Sistema de RH e informe seu nome ao RH (Willian Vianna).',
    },
    {
      id: 'ben-3',
      title: 'Plano de Saúde & Telemedicina Corporativa',
      provider: 'SulAmérica Saúde',
      eligibilityRegime: 'Todos os Colaboradores',
      eligibilityTenure: 'Desde a Admissão',
      coverageSummary: 'Assistência médica nacional com acesso à rede hospitalar e laboratorial credenciada.',
      description:
        'Cobertura médica e hospitalar completa, incluindo telemedicina 24h e possibilidade de inclusão de dependentes legais.',
      howToRequest: 'Solicite inclusão ou atualização de dependentes pelo WhatsApp do Departamento Pessoal até o dia 15.',
    },
    {
      id: 'ben-4',
      title: 'Cartão Benefício & Alimentação Subsidiada',
      provider: 'Flash Benefícios / Refeitório C&R',
      eligibilityRegime: 'Todos os Colaboradores',
      eligibilityTenure: 'Desde a Admissão',
      coverageSummary: 'Refeição diária balanceada nos canteiros + cartão flexível para sede administrativa.',
      description:
        'Garante alimentação saudável durante toda a jornada de 44h semanais, além de lanche reforçado mensal e Kit de Calor bimestral nas frentes de obra.',
      howToRequest: 'Disponibilizado automaticamente na admissão junto ao Kit de Boas-vindas.',
    },
    {
      id: 'ben-5',
      title: 'Reconhecimento por Tempo de Casa (1, 3 e 5 anos)',
      provider: 'Cavalcante & Rolim',
      eligibilityRegime: 'Todos os Colaboradores',
      eligibilityTenure: 'Após 6 meses',
      coverageSummary: 'Certificado oficial, menção pública e brinde comemorativo exclusivo CR.',
      description:
        'Celebra a trajetória de fidelidade dos profissionais na Família Cavalcante & Rolim com caneta/caneca premium no escritório e capacete comemorativo na obra.',
      howToRequest: 'Mapeamento automático mensal realizado pelo Setor de RH.',
    },
    {
      id: 'ben-6',
      title: 'Auxílio Capacitação & Escola CR (Horizonte SENAI/SESI)',
      provider: 'Programa Desenvolve C&R',
      eligibilityRegime: 'Escritório',
      eligibilityTenure: 'Após 6 meses',
      coverageSummary: 'Incentivo educacional e capacitação técnica alinhada à Trilha de Crescimento.',
      description:
        'Apoio financeiro para formações técnicas, engenharia, arquitetura e gestão, preparando talentos para evolução interna.',
      howToRequest: 'Alinhe com seu gestor direto e protocole a solicitação junto ao RH.',
    },
  ],
  vacations: [
    {
      id: 'vac-1',
      employeeName: 'Ronaldo Santos Canuto',
      role: 'Engenheiro Civil',
      sectorOrSite: 'Manta - Cavalcante e Rolim Design SPE',
      photoUrl: GENERATED_ASSETS.avatar1,
      periodType: 'current_month',
      startDate: '09 Nov 2026',
      endDate: '28 Nov 2026',
      focalPointName: 'Eng. Henrique Barros',
      focalPointRole: 'Coord. de Engenharia',
    },
    {
      id: 'vac-2',
      employeeName: 'Beatriz Monteiro',
      role: 'Analista de Suprimentos Sênior',
      sectorOrSite: 'Matriz - Cavalcante e Rolim Empreendimentos',
      photoUrl: GENERATED_ASSETS.avatar2,
      periodType: 'current_month',
      startDate: '16 Nov 2026',
      endDate: '05 Dez 2026',
      focalPointName: 'Willian Vianna',
      focalPointRole: 'Apoio Administrativo / RH',
    },
    {
      id: 'vac-3',
      employeeName: 'Adeilton Antonio da Silva Santos Filho',
      role: 'Encarregado de Manutenção',
      sectorOrSite: 'Watal Patacho Eco Boutique Residence SPE',
      photoUrl: GENERATED_ASSETS.avatar3,
      periodType: 'next_month',
      startDate: '07 Dez 2026',
      endDate: '26 Dez 2026',
      focalPointName: 'Luiz Farias Costa Neto',
      focalPointRole: 'Liderança de Campo',
    },
    {
      id: 'vac-4',
      employeeName: 'Aline Patricia Ferreira Nunes',
      role: 'Serviços Gerais',
      sectorOrSite: 'Matriz - Cavalcante e Rolim Empreendimentos',
      photoUrl: GENERATED_ASSETS.avatar2,
      periodType: 'next_month',
      startDate: '14 Dez 2026',
      endDate: '02 Jan 2027',
      focalPointName: 'Equipe Administrativa Matriz',
      focalPointRole: 'Sede Corporativa',
    },
  ],
  // Real December Birthdays from the 3 attached PDFs (Manta, Matriz, Watal)
  birthdays: [
    {
      id: 'bday-watal-1',
      employeeName: 'Luiz Farias Costa Neto',
      role: 'Pedreiro',
      sectorOrSite: 'Watal Patacho Eco Boutique Residence SPE',
      photoUrl: GENERATED_ASSETS.avatar1,
      birthDay: 1,
      birthMonth: 'Dezembro',
      messages: [
        {
          id: 'msg-w1',
          senderName: 'Willian Vianna',
          senderRole: 'Recursos Humanos',
          message: 'Parabéns, Luiz! Que dezembro comece com muita saúde, paz e realizações ao lado da sua família.',
          createdAt: 'Hoje, 08:30',
        },
      ],
    },
    {
      id: 'bday-manta-1',
      employeeName: 'Lucas Augusto de Gusmão Lima',
      role: 'Servente de Pedreiro',
      sectorOrSite: 'Manta - Cavalcante e Rolim Design SPE',
      photoUrl: GENERATED_ASSETS.avatar3,
      birthDay: 4,
      birthMonth: 'Dezembro',
      messages: [],
    },
    {
      id: 'bday-watal-2',
      employeeName: 'Adeilton Antonio da Silva Santos Filho',
      role: 'Encarregado de Manutenção',
      sectorOrSite: 'Watal Patacho Eco Boutique Residence SPE',
      photoUrl: GENERATED_ASSETS.avatar3,
      birthDay: 4,
      birthMonth: 'Dezembro',
      messages: [
        {
          id: 'msg-w2',
          senderName: 'Ronaldo Santos Canuto',
          senderRole: 'Engenheiro Civil',
          message: 'Feliz aniversário, Adeilton! Obrigado pela parceria e comprometimento diário em obra.',
          createdAt: 'Ontem, 16:45',
        },
      ],
    },
    {
      id: 'bday-manta-2',
      employeeName: 'Ronaldo Santos Canuto',
      role: 'Engenheiro Civil',
      sectorOrSite: 'Manta - Cavalcante e Rolim Design SPE',
      photoUrl: GENERATED_ASSETS.avatar1,
      birthDay: 5,
      birthMonth: 'Dezembro',
      messages: [
        {
          id: 'msg-m2',
          senderName: 'Marina Vasconcelos',
          senderRole: 'Arquiteta de Coordenação',
          message: 'Parabéns, Eng. Ronaldo! Sucesso contínuo à frente do Manta Design SPE.',
          createdAt: 'Hoje, 09:10',
        },
      ],
    },
    {
      id: 'bday-matriz-1',
      employeeName: 'Aline Patricia Ferreira Nunes',
      role: 'Serviços Gerais',
      sectorOrSite: 'Matriz - Cavalcante e Rolim Empreendimentos',
      photoUrl: GENERATED_ASSETS.avatar2,
      birthDay: 9,
      birthMonth: 'Dezembro',
      messages: [
        {
          id: 'msg-mt1',
          senderName: 'Willian Vianna',
          senderRole: 'Recursos Humanos',
          message: 'Feliz aniversário, Aline! Seu cuidado diário faz toda a diferença na nossa Matriz.',
          createdAt: 'Hoje, 09:20',
        },
      ],
    },
    {
      id: 'bday-manta-3',
      employeeName: 'Felipe Sebastião da Silva Santos',
      role: 'Servente de Pedreiro',
      sectorOrSite: 'Manta - Cavalcante e Rolim Design SPE',
      photoUrl: GENERATED_ASSETS.avatar1,
      birthDay: 14,
      birthMonth: 'Dezembro',
      messages: [],
    },
    {
      id: 'bday-manta-4',
      employeeName: 'Alessandro Santos da Silva',
      role: 'Servente de Pedreiro',
      sectorOrSite: 'Manta - Cavalcante e Rolim Design SPE',
      photoUrl: GENERATED_ASSETS.avatar3,
      birthDay: 16,
      birthMonth: 'Dezembro',
      messages: [],
    },
    {
      id: 'bday-watal-3',
      employeeName: 'João Paulo dos Santos Nascimento',
      role: 'Ajudante Prático',
      sectorOrSite: 'Watal Patacho Eco Boutique Residence SPE',
      photoUrl: GENERATED_ASSETS.avatar1,
      birthDay: 23,
      birthMonth: 'Dezembro',
      messages: [],
    },
    {
      id: 'bday-watal-4',
      employeeName: 'José Edson Teixeira',
      role: 'Pedreiro',
      sectorOrSite: 'Watal Patacho Eco Boutique Residence SPE',
      photoUrl: GENERATED_ASSETS.avatar3,
      birthDay: 24,
      birthMonth: 'Dezembro',
      messages: [],
    },
  ],
  onboardingSteps: [
    {
      id: 'onb-1',
      order: 1,
      title: 'Nossa História, Missão, Visão e Valores',
      subtitle: 'Mais de 25 anos no mercado imobiliário alagoano e referência na Rota Ecológica dos Milagres/AL.',
      estimatedMinutes: 5,
      coverImage: GENERATED_ASSETS.heroTower,
      originalPdfUrl: ATTACHED_ASSETS.codeOfConductPdf,
      originalFileName: 'CR_Codigo_de_Conduta_e_Etica.pdf',
      sections: [
        {
          id: 'onb-1-1',
          heading: 'Nossa História na Família Cavalcante & Rolim',
          content:
            'A Cavalcante & Rolim Empreendimentos nasceu com a essência e a base de uma empresa familiar. Com mais de 25 anos de experiência no mercado imobiliário alagoano por parte de seu corpo societário, consolidou-se como referência de alto padrão e luxo na região da Rota Ecológica dos Milagres/AL.',
        },
        {
          id: 'onb-1-2',
          heading: 'Missão, Visão e os 7 Valores',
          content:
            'Missão: Conceber empreendimentos imobiliários inovadores, com qualidade, segurança e rentabilidade, concretizando sonhos que atendam às expectativas de todos.\n\nVisão: Ser referência em empreendimentos imobiliários de médio e alto padrão em Alagoas, com sustentabilidade.\n\nValores: Honestidade, Respeito, Comprometimento, Transparência nas relações, Ética, Competência técnica e Qualidade.',
        },
      ],
      challenge: {
        id: 'chal-onb-1',
        title: 'Quiz de Integração: Identidade C&R',
        type: 'multiple_choice',
        questions: [
          {
            id: 'q-o1-1',
            prompt: 'Onde a Cavalcante & Rolim consolidou-se como referência de alto padrão e luxo em Alagoas?',
            options: [
              'Apenas em obras rodoviárias do sertão',
              'Na região da Rota Ecológica dos Milagres/AL e mercado imobiliário alagoano',
              'Exclusivamente fora do Nordeste',
            ],
            correctIndex: 1,
            explanation: 'Com mais de 25 anos de experiência do corpo societário, a C&R é referência na Rota Ecológica dos Milagres/AL.',
          },
        ],
      },
    },
    {
      id: 'onb-2',
      order: 2,
      title: 'Vínculos, Jornada de 44h e Direitos do Colaborador',
      subtitle: 'Regras de fardamento, ponto biométrico/manual, prazos de atestado e pagamentos.',
      estimatedMinutes: 6,
      coverImage: GENERATED_ASSETS.auroraTower,
      sections: [
        {
          id: 'onb-2-1',
          heading: 'Jornada de Trabalho, Fardamento e Ponto',
          content:
            'A jornada padrão é de 44 horas semanais. O registro no ponto biométrico (sede) ou Cartão de Ponto manual (obras) é obrigatório na entrada, saída e intervalos. O fardamento e os EPIs são gratuitos e de uso obrigatório, devendo ser devolvidos integralmente em caso de desligamento.',
        },
        {
          id: 'onb-2-2',
          heading: 'Prazos Legais e Direitos',
          content:
            'Atestados e justificativas de falta devem ser entregues ao RH em até 48 horas a contar do início da ausência. Pagamento salarial até o 5º dia útil; período de experiência de 45 + 45 dias (máximo 90 dias); 13º salário (1ª parcela até fim de novembro, 2ª até 20 de dezembro).',
        },
      ],
      challenge: {
        id: 'chal-onb-2',
        title: 'Associação: Direitos & Prazos C&R',
        type: 'matching',
        questions: [],
        matchingPairs: [
          { id: 'ov-1', term: 'Até 48 horas', definition: 'Prazo máximo para entrega de atestado ou justificativa ao RH' },
          { id: 'ov-2', term: 'Até o 5º dia útil', definition: 'Data limite para depósito do pagamento mensal' },
          { id: 'ov-3', term: '44 horas semanais', definition: 'Jornada padrão na sede e canteiros de obra' },
        ],
      },
    },
    {
      id: 'onb-3',
      order: 3,
      title: 'Ética, Conflito de Interesses & Tolerância Zero ao Assédio',
      subtitle: 'Integridade corporativa, LGPD, Lei Anticorrupção e Canal de Denúncias sigiloso.',
      estimatedMinutes: 7,
      coverImage: GENERATED_ASSETS.safetySite,
      sections: [
        {
          id: 'onb-3-1',
          heading: 'Conflito de Interesses, Parentesco e Agiotagem',
          content:
            'É vedada a prática de empréstimos financeiros com características de agiotagem entre colaboradores. Parentes na área administrativa não podem exercer relação de subordinação direta. É terminantemente proibido receber comissões ou propinas de clientes e fornecedores.',
        },
        {
          id: 'onb-3-2',
          heading: 'Tolerância Zero e Canal de Denúncias (Lei 14.457/2022)',
          content:
            'A C&R adota tolerância zero para assédio moral, sexual (passível de justa causa, art. 482 CLT) e assédio eleitoral. O Canal de Denúncias (via QR Code nos refeitórios/murais ou Rota Alternativa à Comissão Externa) garante anonimato e proíbe retaliação.',
        },
      ],
      challenge: {
        id: 'chal-onb-3',
        title: 'Cenário Prático de Compliance',
        type: 'decision_scenario',
        scenarioContext:
          'Um colaborador presencia uma tentativa de intimidação contra um colega durante a cobrança de metas em obra.',
        questions: [
          {
            id: 'q-o3-1',
            prompt: 'Qual é a postura prevista pelo Código de Conduta e Ética (MANU-RH-V001)?',
            options: [
              'Registrar a ocorrência pelo Canal de Denúncias (QR Code ou Rota Alternativa), com garantia de sigilo, anonimato e proteção contra retaliação.',
              'Ignorar a situação pois cobranças de meta permitem intimidação.',
              'Divulgar boatos em grupos pessoais sem apuração.',
            ],
            correctIndex: 0,
            explanation: 'A cobrança por resultados deve respeitar a dignidade e urbanidade; denúncias contam com apuração independente e sigilo.',
          },
        ],
      },
    },
    {
      id: 'onb-4',
      order: 4,
      title: 'Regras de Convivência, Segurança & Trilha de Crescimento CR',
      subtitle: 'Conduta nos canteiros, Capacete de Ouro CR e progressão interna.',
      estimatedMinutes: 6,
      coverImage: GENERATED_ASSETS.safetySite,
      sections: [
        {
          id: 'onb-4-1',
          heading: 'Regras de Convivência e Operações Internas',
          content:
            'É expressamente proibido: consumir álcool/substâncias ilícitas, fumar fora das áreas permitidas, alimentar-se fora da copa/refeitório, remover ferramentas sem autorização formal, vender mercadorias no expediente ou usar o celular em momentos que comprometam produtividade e segurança.',
        },
      ],
      challenge: {
        id: 'chal-onb-4',
        title: 'Verdadeiro ou Falso: Regras de Convivência',
        type: 'true_false',
        questions: [
          {
            id: 'q-o4-1',
            prompt: 'É permitido remover materiais ou ferramentas da empresa para uso temporário sem autorização formal desde que sejam devolvidos na segunda-feira.',
            options: ['Verdadeiro', 'Falso'],
            correctIndex: 1,
            explanation: 'Falso! Remover materiais, ferramentas ou bens físicos sem autorização formal é ato ilícito passível de demissão.',
          },
        ],
      },
    },
    {
      id: 'onb-5',
      order: 5,
      title: 'Indicação de Talentos & Canais Diretos C&R',
      subtitle: 'Como funciona o cadastro no sistema de RH e atendimento com Willian Vianna.',
      estimatedMinutes: 4,
      coverImage: GENERATED_ASSETS.avatar1,
      embeddedGuideImage: ATTACHED_ASSETS.hrRegistrationGuide,
      sections: [
        {
          id: 'onb-5-1',
          heading: 'Estrutura de Apoio & Programa Indique um Colega',
          content:
            'Willian Vianna lidera o Setor de Recursos Humanos (WhatsApp +55 82 98766-0143). Sempre que indicar um talento, oriente o candidato a seguir os 6 passos do guia visual de cadastro no sistema de RH.',
        },
      ],
      challenge: {
        id: 'chal-onb-5',
        title: 'Conexão com o RH C&R',
        type: 'multiple_choice',
        questions: [
          {
            id: 'q-o5-1',
            prompt: 'Quem é o responsável direto pelo Setor de Recursos Humanos (RH) na Cavalcante & Rolim?',
            options: ['Willian Vianna', 'Carlos Eduardo', 'Marcos Vinícius'],
            correctIndex: 0,
            explanation: 'Willian Vianna é o responsável pelo Setor de RH e atende diretamente pelo canal oficial de WhatsApp.',
          },
        ],
      },
    },
  ],
  manuals: [
    {
      id: 'man-codigo-conduta',
      code: 'MANU-RH-V001',
      title: 'Código de Conduta e Ética Corporativa Cavalcante & Rolim',
      area: 'RH',
      summary:
        'Documento oficial aprovado pelo Jurídico (Rev. 000 · 30 páginas) com diretrizes de postura profissional, combate ao assédio, conflito de interesses, fardamento, ponto, LGPD e direitos.',
      updatedAt: '09/10/2026 · Rev. 000',
      coverImage: GENERATED_ASSETS.heroTower,
      originalPdfUrl: ATTACHED_ASSETS.codeOfConductPdf,
      originalFileName: 'CR_Codigo_de_Conduta_e_Etica_MANU-RH-V001.pdf',
      sections: [
        {
          id: 'cc-1',
          heading: '01. Apresentação, Missão, Visão e Valores',
          content:
            'Nascida com a essência de empresa familiar e mais de 25 anos de experiência no mercado imobiliário alagoano, a Cavalcante & Rolim consolidou-se como referência de alto padrão na Rota Ecológica dos Milagres/AL. Seus valores são: Honestidade, Respeito, Comprometimento, Transparência nas relações, Ética, Competência técnica e Qualidade.',
        },
        {
          id: 'cc-2',
          heading: '02. Combate Rigoroso ao Assédio e Canal de Denúncias',
          content:
            'Tolerância zero contra assédio moral, assédio sexual (sujeito à demissão por justa causa conforme art. 482, alíneas "b" e "j" da CLT) e assédio eleitoral. O Canal de Denúncias via QR Code ou Comissão Externa garante anonimato (Lei nº 14.457/2022) e proíbe qualquer retaliação. Rito de apuração: Triagem até 3 dias úteis, Instrução até 15 dias úteis, Relatório Final em até 5 dias úteis.',
        },
        {
          id: 'cc-3',
          heading: '03. Conflitos de Interesse, Convivência e LGPD',
          content:
            'Proibição absoluta de propinas, comissões, empréstimos com agiotagem e subordinação direta entre parentes na administração. Uso obrigatório de fardamento completo e devolução integral na rescisão. Sigilo profissional rigoroso sobre projetos, clientes e estratégias (Mesa Limpa e Bloqueio de Tela).',
        },
        {
          id: 'cc-4',
          heading: '04. Jornada 44h, Faltas Justificadas e Direitos',
          content:
            'Jornada padrão de 44h semanais com ponto biométrico (sede) ou cartão manual (obras). Comprovantes e atestados devem ser apresentados ao RH em no máximo 48 horas do início da ausência. Faltas legais garantidas: Luto (até 2 dias), Casamento (até 3 dias úteis), Paternidade (5 dias), Doação de Sangue (1 dia/ano), Acompanhamento de filho até 6 anos (1 dia/ano) e Esposa grávida (até 6 consultas). Pagamento até o 5º dia útil.',
        },
      ],
      challenge: {
        id: 'chal-codigo-conduta',
        title: 'Avaliação Oficial do Código de Conduta (5 Questões)',
        type: 'multiple_choice',
        questions: [
          {
            id: 'q-cc-1',
            prompt: 'Qual é o prazo regulamentar para que o colaborador entregue ao RH o documento de justificativa de falta (atestado/comprovante)?',
            options: [
              'Até 24 horas após o retorno ao trabalho.',
              'Em até 48 horas a partir do início da ausência.',
              'No último dia útil do mês corrente.',
              'Apenas no momento da homologação da folha de pagamento.',
            ],
            correctIndex: 1,
            explanation: 'Seção 7.3 do Código: O colaborador deve apresentar o comprovante/atestado ao RH em até 48 horas a contar do início da ausência.',
          },
          {
            id: 'q-cc-2',
            prompt: 'Sobre o uso e devolução do fardamento (uniforme) corporativo, qual afirmativa está CORRETA?',
            options: [
              'O uniforme pode ser levado e mantido pelo colaborador após a demissão.',
              'O custo do primeiro uniforme é descontado na folha de pagamento.',
              'É obrigatória a devolução de todo o fardamento e EPIs no ato do desligamento.',
              'O colaborador pode trabalhar sem fardamento caso esteja em lavagem.',
            ],
            correctIndex: 2,
            explanation: 'Seção 7.1 do Código: Na rescisão, o colaborador obriga-se a restituir todo o fardamento e EPIs sob sua posse.',
          },
          {
            id: 'q-cc-3',
            prompt: 'Como o Código de Conduta posiciona a prática de empréstimos financeiros entre colaboradores com características de agiotagem?',
            options: [
              'Permite, desde que o contrato seja registrado em cartório.',
              'É não recomendada e vedada; a empresa não assume a responsabilidade de intermediar essas situações.',
              'A empresa atua como fiadora dos empréstimos entre funcionários.',
              'É permitida apenas entre colaboradores de mesmo nível hierárquico.',
            ],
            correctIndex: 1,
            explanation: 'Seção 5.2 do Código: É vedada a prática de empréstimos financeiros com características de agiotagem.',
          },
          {
            id: 'q-cc-4',
            prompt: 'Em relação aos colaboradores que possuem grau de parentesco entre si na área administrativa, qual é a regra imperativa?',
            options: [
              'Devem trabalhar em turnos opostos obrigatoriamente.',
              'Jamais podem trabalhar no mesmo prédio.',
              'Devem manter vínculo estritamente profissional e jamais exercer relação de subordinação direta ou hierárquica.',
              'Um dos parentes deve ser obrigatoriamente promovido.',
            ],
            correctIndex: 2,
            explanation: 'Seção 5.2: Parentes na área administrativa devem manter vínculo estritamente profissional sem subordinação direta.',
          },
          {
            id: 'q-cc-5',
            prompt: 'Qual a tolerância e a sanção prevista para episódios comprovados de assédio sexual dentro da empresa?',
            options: [
              'Tolerância zero, aplicando-se demissão imediata por Justa Causa (CLT), além das implicações cíveis e criminais.',
              'Aplicação de suspensão de 3 dias sem remuneração.',
              'Mudança do funcionário infrator para outra obra da Rota Ecológica dos Milagres.',
              'Advertência verbal reservada conduzida pela diretoria.',
            ],
            correctIndex: 0,
            explanation: 'Seção 4.2: Tolerância zero com rescisão por justa causa (art. 482 CLT) sem prejuízo de providências cíveis e criminais.',
          },
        ],
      },
    },
    {
      id: 'man-endomarketing',
      code: 'MANU-RH-002',
      title: 'Guia Operacional do Plano de Endomarketing & Capacete de Ouro CR',
      area: 'RH',
      summary: 'Manual de aplicação dos rituais de reconhecimento no Escritório e Obra, Trilha de Crescimento CR, Brindes e Indicadores de Sucesso.',
      updatedAt: 'Jul–Dez 2026',
      coverImage: GENERATED_ASSETS.auroraTower,
      originalPdfUrl: ATTACHED_ASSETS.endomarketingPdf,
      originalFileName: 'PORTAL_RH_Apresentacao_Endomarketing.pdf',
      sections: [
        {
          id: 'me-1',
          heading: '1. Ritual do Capacete de Ouro CR e Trilha de Crescimento',
          content:
            'Os encarregados avaliam mensalmente Segurança, Comportamento, Trabalho em Equipe e Qualidade. O histórico objetivo das avaliações sustenta a Trilha de Crescimento CR: Servente -> Oficial (3+ avaliações consistentes) -> Encarregado de Frente -> Mestre de Obras.',
        },
        {
          id: 'me-2',
          heading: '2. Indicadores de Sucesso (Escritório e Obra)',
          content:
            'Escritório: >= 80% de presença nos eventos coletivos e >= 70% de resposta na pesquisa de clima. Obra: >= 60% de engajamento no DDS Turbinado, adesão dos encarregados ao Capacete de Ouro CR, redução de incidentes e número de promoções via Trilha de Crescimento.',
        },
      ],
      challenge: {
        id: 'chal-man-endo',
        title: 'Desafio: Indicadores de Endomarketing',
        type: 'true_false',
        questions: [
          {
            id: 'q-me-1',
            prompt: 'As avaliações mensais do Capacete de Ouro CR formam o histórico objetivo utilizado quando surge uma vaga na Trilha de Crescimento CR.',
            options: ['Verdadeiro', 'Falso'],
            correctIndex: 0,
            explanation: 'Verdadeiro! RH e Engenharia consultam primeiro os colaboradores já elegíveis pelo histórico do Capacete de Ouro.',
          },
        ],
      },
    },
    {
      id: 'man-1',
      code: 'MNL-SST-014',
      title: 'Manual de Segurança em Obras Verticais & NR-18 / NR-35',
      area: 'SST',
      summary: 'Diretrizes técnicas para proteção coletiva, bandejas, linhas de vida, balancins e bloqueio de energias perigosas.',
      updatedAt: 'Nov 2026 · Rev. 04',
      coverImage: GENERATED_ASSETS.safetySite,
      sections: [
        {
          id: 'm1-1',
          heading: '1. Objetivo e Campo de Aplicação',
          content:
            'Este manual estabelece os requisitos mínimos obrigatórios de Saúde e Segurança do Trabalho aplicados a todos os colaboradores próprios e terceirizados nos empreendimentos da Cavalcante & Rolim Empreendimentos.',
        },
        {
          id: 'm1-2',
          heading: '2. Proteção Perimetral e Vãos de Elevadores',
          content:
            'Todos os vãos de acesso a elevadores e periferias de lajes recém-desformadas devem receber guarda-corpo rígido com travessão superior a 1,20m, intermediário a 0,70m e rodapé de 0,20m com tela de fechamento.',
        },
      ],
      challenge: {
        id: 'chal-man-1',
        title: 'Desafio Técnico: Guarda-Corpo & NR-35',
        type: 'multiple_choice',
        questions: [
          {
            id: 'q-m1-1',
            prompt: 'Qual a altura regulamentar do travessão superior do guarda-corpo rígido segundo o manual MNL-SST-014?',
            options: ['0,90 m', '1,20 m', '1,50 m'],
            correctIndex: 1,
            explanation: 'O travessão superior deve estar a 1,20m, com intermediário a 0,70m e rodapé de 0,20m.',
          },
        ],
      },
    },
    {
      id: 'man-3',
      code: 'MNL-QLD-009',
      title: 'Procedimento de Controle Tecnológico de Concreto e Revestimentos Nobres',
      area: 'Qualidade',
      summary: 'Padrões PBQP-H Nível A para recebimento de concreto usinado, ensaios de abatimento (Slump) e assentamento de mármores.',
      updatedAt: 'Nov 2026 · Rev. 05',
      coverImage: GENERATED_ASSETS.auroraTower,
      sections: [
        {
          id: 'm3-1',
          heading: '1. Recebimento e Rastreabilidade de Concreto',
          content:
            'Todo caminhão betoneira deve passar por ensaio de Slump Test antes do lançamento, com moldagem de corpos de prova identificados por pavimento e peça estrutural.',
        },
      ],
      challenge: {
        id: 'chal-man-3',
        title: 'Associação: Controle de Qualidade',
        type: 'matching',
        questions: [],
        matchingPairs: [
          { id: 'qm-1', term: 'Slump Test', definition: 'Ensaio de abatimento obrigatório antes do lançamento do concreto' },
          { id: 'qm-2', term: 'Dupla Colagem', definition: 'Técnica exigida para assentamento de pedras naturais de grande formato' },
          { id: 'qm-3', term: 'PBQP-H Nível A', definition: 'Certificação de excelência construtiva mantida pela C&R' },
        ],
      },
    },
    {
      id: 'man-4',
      code: 'MNL-DP-007',
      title: 'Manual de Ponto Eletrônico, Férias e Cadastro no Sistema de RH',
      area: 'DP',
      summary: 'Regras de fechamento de ponto, prazos de atestado (48h), férias e guia de cadastro de currículos para indicações.',
      updatedAt: 'Nov 2026 · Rev. 03',
      coverImage: GENERATED_ASSETS.heroTower,
      embeddedGuideImage: ATTACHED_ASSETS.hrRegistrationGuide,
      sections: [
        {
          id: 'm4-1',
          heading: '1. Ponto, Férias e Atestados',
          content:
            'Atestados médicos devem ser entregues ao RH em até 48 horas a contar do início da ausência. Férias são concedidas nos 11 meses seguintes ao período aquisitivo, com pagamento (salário + 1/3) até 2 dias antes do início do gozo.',
        },
        {
          id: 'm4-2',
          heading: '2. Passo a Passo para Cadastro de Currículo (Indique um Colega)',
          content:
            'Utilize o guia visual integrado abaixo para auxiliar novos candidatos a cadastrar o currículo em PDF no sistema oficial de recrutamento.',
        },
      ],
      challenge: {
        id: 'chal-man-4',
        title: 'Verificação Rápida: Prazos de DP',
        type: 'multiple_choice',
        questions: [
          {
            id: 'q-m4-1',
            prompt: 'Com quantos dias de antecedência mínima antes do início do gozo ocorre o pagamento das férias (salário + 1/3)?',
            options: ['Até 2 dias antes', 'No dia do retorno', '15 dias depois'],
            correctIndex: 0,
            explanation: 'Conforme o Código de Conduta (Seção 11), o pagamento de férias ocorre até 2 dias antes do início do gozo.',
          },
        ],
      },
    },
    {
      id: 'man-5',
      code: 'MNL-ENG-011',
      title: 'Diretrizes BIM e Compatibilização de Projetos Executivos',
      area: 'Engenharia',
      summary: 'Fluxo de revisão de modelos IFC/Revit, controle de interferências e emissão de pranchas liberadas em canteiro.',
      updatedAt: 'Nov 2026 · Rev. 02',
      coverImage: GENERATED_ASSETS.safetySite,
      sections: [
        {
          id: 'm5-1',
          heading: '1. Fonte Única da Verdade em Obra',
          content:
            'Somente pranchas com carimbo "Liberado para Obra" no ambiente comum de dados (CDE) têm validade executiva em canteiro. Versões obsoletas devem ser imediatamente recolhidas.',
        },
      ],
      challenge: {
        id: 'chal-man-5',
        title: 'Decisão em Campo: Projetos BIM',
        type: 'decision_scenario',
        scenarioContext:
          'Durante a marcação de alvenaria no Manta Design SPE, uma prancha impressa antiga diverge da versão digital atual no CDE.',
        questions: [
          {
            id: 'q-m5-1',
            prompt: 'Qual decisão garante o padrão de engenharia da Cavalcante & Rolim?',
            options: [
              'Suspender a marcação no trecho divergente, validar a última revisão "Liberado para Obra" no CDE e recolher a prancha obsoleta.',
              'Executar conforme a prancha impressa antiga para não perder produção.',
              'Ajustar a olho nu sem consultar a coordenação.',
            ],
            correctIndex: 0,
            explanation: 'Apenas a revisão mais recente marcada como "Liberado para Obra" no CDE possui validade executiva.',
          },
        ],
      },
    },
  ],
  gamificationRules: [
    {
      id: 'rule-1',
      actionKey: 'daily_login',
      label: 'Acessar o portal diariamente',
      description: 'Check-in diário automático ao abrir o Portal Signature.',
      points: 10,
    },
    {
      id: 'rule-2',
      actionKey: 'congratulate',
      label: 'Enviar felicitação a um aniversariante',
      description: 'Postar mensagem no Mural de Felicitações de um colega.',
      points: 20,
    },
    {
      id: 'rule-3',
      actionKey: 'read_announcement',
      label: 'Ler um comunicado até o fim',
      description: 'Confirmar leitura clicando em "Li e Compreendi" no comunicado.',
      points: 30,
    },
    {
      id: 'rule-4',
      actionKey: 'complete_manual',
      label: 'Concluir a leitura de um Manual Interno',
      description: 'Finalizar a leitura integral de qualquer manual na biblioteca.',
      points: 50,
    },
    {
      id: 'rule-5',
      actionKey: 'complete_onboarding',
      label: 'Completar o Onboarding completo',
      description: 'Concluir todas as etapas da trilha de integração Signature Spaces.',
      points: 150,
    },
    {
      id: 'rule-6',
      actionKey: 'minigame_answer',
      label: 'Acertar questões nos Mini-Games Interativos',
      description: '+25 pts por resposta correta e bônus de +50 pts ao gabaritar o desafio.',
      points: 25,
    },
  ],
  rewards: [
    {
      id: 'rew-1',
      title: 'Day Off de Aniversário',
      description: 'Um dia inteiro de folga remunerada para celebrar no mês do seu aniversário ou data combinada com a liderança.',
      requiredPoints: 500,
      tierName: 'Nível Bronze Signature',
    },
    {
      id: 'rew-2',
      title: 'Vale-Jantar Signature ou Kit Executivo C&R',
      description: 'Experiência gastronômica para duas pessoas em restaurante parceiro ou Kit Executivo em couro e aço escovado C&R.',
      requiredPoints: 1000,
      tierName: 'Nível Prata Signature',
    },
    {
      id: 'rew-3',
      title: 'Voucher Bem-Estar & Spa Experience',
      description: 'Dia de relaxamento completo ou crédito equivalente para equipamentos esportivos e bem-estar.',
      requiredPoints: 1500,
      tierName: 'Nível Ouro Signature',
    },
    {
      id: 'rew-4',
      title: 'Fim de Semana Resort Litoral Alagoano',
      description: 'Diárias com café da manhã para casal em resort parceiro na Rota Ecológica dos Milagres/AL.',
      requiredPoints: 2500,
      tierName: 'Nível Diamante Signature',
    },
  ],
  departments: [
    {
      id: 'dep-rh',
      name: 'Recursos Humanos (RH)',
      shortName: 'RH',
      responsibleName: 'Willian Vianna',
      responsibleRole: 'Responsável pelo Setor de RH',
      whatsappNumber: '558287660143',
      email: 'rh@cavalcanterolim.com.br',
      hours: 'Seg a Sex · 08h00 às 18h00',
      description: 'Endomarketing, Onboarding, Capacete de Ouro CR, Indique um Colega, Resgate de Prêmios Signature e Apoio ao Colaborador.',
    },
    {
      id: 'dep-dp',
      name: 'Departamento Pessoal (DP)',
      shortName: 'DP',
      responsibleName: 'Coordenação de DP C&R',
      responsibleRole: 'Folha, Ponto & Benefícios',
      whatsappNumber: '558287660143',
      email: 'dp@cavalcanterolim.com.br',
      hours: 'Seg a Sex · 08h00 às 17h30',
      description: 'Espelho de ponto, programação de férias, plano de saúde, atestados (prazo 48h) e documentação admissional.',
    },
    {
      id: 'dep-sst',
      name: 'Saúde e Segurança do Trabalho (SST)',
      shortName: 'SST',
      responsibleName: 'Engenharia de Segurança C&R',
      responsibleRole: 'Prevenção & Normas NR',
      whatsappNumber: '558287660143',
      email: 'sst@cavalcanterolim.com.br',
      hours: 'Plantão de Obra · 07h00 às 17h00',
      description: 'DDS Turbinado, liberação de Permissão de Trabalho, EPIs, ASOs periódicos e inspeções de segurança nos canteiros.',
    },
    {
      id: 'dep-qld',
      name: 'Qualidade & Processos',
      shortName: 'Qualidade',
      responsibleName: 'Gestão da Qualidade PBQP-H',
      responsibleRole: 'Auditorias & Procedimentos',
      whatsappNumber: '558287660143',
      email: 'qualidade@cavalcanterolim.com.br',
      hours: 'Seg a Sex · 08h00 às 18h00',
      description: 'Manuais técnicos, fichas de verificação de serviço (FVS), ensaios tecnológicos e certificação PBQP-H Nível A.',
    },
  ],
  rankingPeers: INITIAL_RANKING_PEERS,
};
