const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Logo changes
content = content.replace(
    /<h1 className="text-3xl font-extrabold text-dark tracking-tight">mão<span className="text-primary">A<\/span>obra<\/h1>/g,
    `<h1 className="text-3xl font-extrabold tracking-tight"><span className="text-dark">mão</span><span className="text-primary">A</span><span className="text-dark">obra</span></h1>`
);
content = content.replace(
    /<i className="ph-fill ph-wrench text-3xl"><\/i> mãoAobra/g,
    `<i className="ph-fill ph-wrench text-3xl"></i> <span className="text-dark">mão</span><span className="text-primary">A</span><span className="text-dark">obra</span>`
);

// 2. Chat Modal injection
const chatModalCode = `
        const OrderChatModal = ({ order, onClose }) => {
            if(!order) return null;
            const { users, currentUser, setOrders, orders, services, showToast } = useAppStore();
            const [message, setMessage] = useState('');
            const [imageUrl, setImageUrl] = useState('');
            const chatRef = React.useRef(null);
            
            const client = users.find(u => u.id === order.contratante_id);
            const worker = users.find(u => u.id === order.worker_id);
            const srv = services.find(s => s.id === order.servico_id);
            const otherUser = currentUser.role === 'CONTRATANTE' ? worker : client;

            React.useEffect(() => {
                if(chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
            }, [order.chat_history]);

            const handleSend = (e) => {
                e.preventDefault();
                if(!message.trim() && !imageUrl.trim()) return;
                const newMessage = { sender: currentUser.id, text: message, image: imageUrl, time: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) };
                const newHistory = [...(order.chat_history || []), newMessage];
                setOrders(orders.map(o => o.id === order.id ? {...o, chat_history: newHistory} : o));
                setMessage('');
                setImageUrl('');
            };

            const updateStatus = (newStatus) => {
                setOrders(orders.map(o => o.id === order.id ? {...o, status: newStatus} : o));
                showToast(\`Pedido atualizado para: \${newStatus}\`);
                if(['RECUSADO'].includes(newStatus)) onClose();
            };

            return ReactDOM.createPortal(
                <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-[99999] flex flex-col md:p-10 animate-fade-in">
                    <div className="bg-gray-50 flex-1 md:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-w-4xl w-full mx-auto animate-slide-down relative">
                        <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <img src={otherUser?.foto_perfil_url} className="w-12 h-12 rounded-full border-2 border-primary object-cover" />
                                <div>
                                    <h3 className="font-extrabold text-dark">{otherUser?.nome}</h3>
                                    <p className="text-xs text-primary font-bold">{srv?.titulo || 'Serviço Personalizado'}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-full flex items-center justify-center text-dark transition"><i className="ph-bold ph-x text-xl"></i></button>
                        </div>
                        
                        <div className="bg-orange-50 p-3 border-b border-orange-100 flex items-center justify-between text-sm">
                            <div><span className="font-extrabold text-orange-800">Status:</span> <span className="font-bold text-orange-600">{order.status}</span></div>
                            <div className="font-extrabold text-primary">R$ {order.preco_final}</div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={chatRef}>
                            {(order.chat_history || []).map((msg, i) => {
                                const isMe = msg.sender === currentUser.id;
                                return (
                                    <div key={i} className={\`flex \${isMe ? 'justify-end' : 'justify-start'}\`}>
                                        <div className={\`max-w-[85%] md:max-w-[70%] rounded-2xl p-3 \${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white border border-gray-200 text-dark rounded-tl-none shadow-sm'}\`}>
                                            {msg.image && <img src={msg.image} className="max-w-full rounded-xl mb-2 object-cover max-h-64 border border-white/20" alt="anexo" />}
                                            {msg.text && <p className="text-sm font-medium whitespace-pre-wrap">{msg.text}</p>}
                                            <div className={\`text-[10px] mt-1 text-right \${isMe ? 'text-white/70' : 'text-gray-400'}\`}>{msg.time}</div>
                                        </div>
                                    </div>
                                )
                            })}
                            {(order.chat_history || []).length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <i className="ph-fill ph-chat-circle-dots text-6xl mb-2 text-gray-200"></i>
                                    <p className="font-bold">Nenhuma mensagem ainda.</p>
                                    <p className="text-sm">Envie uma mensagem para começar!</p>
                                </div>
                            )}
                        </div>

                        {currentUser.role === 'TRABALHADOR' && order.status === 'PENDENTE' && (
                            <div className="p-4 bg-white border-t border-gray-100 flex gap-3">
                                <button onClick={() => updateStatus('RECUSADO')} className="flex-1 py-3 bg-red-50 text-red-600 font-extrabold rounded-xl hover:bg-red-100 transition border border-red-100">Recusar</button>
                                <button onClick={() => updateStatus('EM_ANDAMENTO')} className="flex-1 py-3 bg-green-500 text-white font-extrabold rounded-xl hover:bg-green-600 shadow-lg shadow-green-500/30 transition transform hover:-translate-y-1">Aceitar Serviço</button>
                            </div>
                        )}
                        {currentUser.role === 'TRABALHADOR' && order.status === 'EM_ANDAMENTO' && (
                            <div className="p-4 bg-white border-t border-gray-100">
                                <button onClick={() => updateStatus('CONCLUIDO')} className="w-full py-4 bg-dark text-white font-extrabold rounded-xl shadow-xl flex justify-center items-center gap-2 hover:bg-black transition transform hover:-translate-y-1"><i className="ph-fill ph-check-circle text-xl"></i> Finalizar Trabalho</button>
                            </div>
                        )}

                        {!['RECUSADO', 'CONCLUIDO'].includes(order.status) && (
                            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex flex-col gap-3">
                                {imageUrl && (
                                    <div className="relative inline-block self-start">
                                        <img src={imageUrl} className="h-20 rounded-xl border border-gray-200 object-cover shadow-sm" />
                                        <button type="button" onClick={()=>setImageUrl('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md border-2 border-white"><i className="ph-bold ph-x"></i></button>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => {
                                        const url = prompt('Cole a URL da imagem (Ex: Imgur, etc):');
                                        if(url) setImageUrl(url);
                                    }} className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-dark transition shrink-0 border border-gray-200"><i className="ph-bold ph-image text-xl"></i></button>
                                    <input type="text" value={message} onChange={e=>setMessage(e.target.value)} placeholder="Digite sua mensagem..." className="flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition" />
                                    <button type="submit" className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 hover:bg-primaryDark transition shrink-0 transform hover:scale-105"><i className="ph-bold ph-paper-plane-right text-xl"></i></button>
                                </div>
                            </form>
                        )}
                        {order.status === 'CONCLUIDO' && currentUser.role === 'CONTRATANTE' && (
                             <div className="p-4 bg-white border-t border-gray-100 text-center">
                                <p className="text-sm font-bold text-green-600 mb-2">Trabalho Concluído!</p>
                                <p className="text-xs text-gray-500">Vá ao perfil do profissional para deixar uma avaliação.</p>
                             </div>
                        )}
                    </div>
                </div>,
                document.body
            );
        };
`;

if (!content.includes('const OrderChatModal')) {
    content = content.replace('const GuestPrompt', chatModalCode + '\n        const GuestPrompt');
}

// 3. Update ClientOrders to open Chat
content = content.replace(/const ClientOrders = \(\) => {/, `const ClientOrders = () => {\n            const [activeChat, setActiveChat] = useState(null);`);
content = content.replace(
    /<a href={`https:\/\/wa.me\/55\${worker\?\.telefone}\?text=Olá! Sobre o pedido\.\.\.`} target="_blank".*?<\/a>/,
    `<button onClick={() => setActiveChat(o)} className="w-full bg-primary text-white text-sm font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-primaryDark transition shadow-lg shadow-primary/20">
        <i className="ph-fill ph-chat-circle-dots text-xl"></i> Abrir Chat
    </button>`
);
content = content.replace(/<\/div>\n\s*\)\n\s*}\)\}\n\s*<\/div>\n\s*<\/div>/, `</div>\n                                    )\n                                })}\n                            </div>\n                            {activeChat && <OrderChatModal order={orders.find(o => o.id === activeChat.id)} onClose={() => setActiveChat(null)} />}\n                        </div>`);


// 4. Update WorkerDashboard to open Chat
content = content.replace(/const WorkerDashboard = \(\) => {/, `const WorkerDashboard = () => {\n            const [activeChat, setActiveChat] = useState(null);`);
// WorkerDashboard has 'ativos' filter, change to PENDENTE or EM_ANDAMENTO
content = content.replace(/const ativos = myOrders\.filter\(o => o\.status === 'ATIVO'\);/, `const ativos = myOrders.filter(o => ['PENDENTE', 'EM_ANDAMENTO'].includes(o.status));`);
content = content.replace(/<span className="bg-orange-100 text-orange-700 text-sm font-bold px-3 py-1 rounded-lg border border-orange-200">\{ativos\.length\} ativos<\/span>/, `<span className="bg-orange-100 text-orange-700 text-sm font-bold px-3 py-1 rounded-lg border border-orange-200">{ativos.length} solicitações</span>`);

// Replace action buttons in WorkerDashboard
content = content.replace(
    /<a href={`https:\/\/wa\.me\/55\${client\?\.telefone}.*?<\/a>\s*<button onClick=\{\(\) => handleComplete\(o\.id\)\}.*?<\/button>/s,
    `<button onClick={() => setActiveChat(o)} className="bg-primary hover:bg-primaryDark transition text-white py-3 rounded-xl w-full text-center font-extrabold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
        <i className="ph-fill ph-chat-circle-dots text-xl"></i> Acessar Pedido & Chat
    </button>`
);
// Also add chat modal render to WorkerDashboard
content = content.replace(/<\/div>\n\s*\)\n\s*}\)\}\n\s*<\/div>\n\s*<\/div>/, `</div>\n                                    )\n                                })}\n                            </div>\n                            {activeChat && <OrderChatModal order={orders.find(o => o.id === activeChat.id)} onClose={() => setActiveChat(null)} />}\n                        </div>`);


// 5. Replace WorkerServicesCRUD completely
const workerServicesCrudRegex = /const WorkerServicesCRUD = \(\) => \{[\s\S]*?(?=const WorkerProfileEdit = \(\) => \{)/;
const newWorkerServicesCrud = `const WorkerServicesCRUD = () => {
            const { services, currentUser, setServices, showToast } = useAppStore();
            const myServices = services.filter(s => s.worker_id === currentUser.id);

            const addMockService = () => {
                const newSrv = { id: 's'+Date.now(), worker_id: currentUser.id, titulo: 'Novo Serviço', preco_base: 100, descricao: 'Descrição detalhada do serviço que você realiza...', imagem_url: '' };
                setServices([...services, newSrv]);
                showToast('Serviço adicionado! Clique no lápis para editar.');
            };

            const editService = (srv) => {
                const newTitulo = prompt("Nome do serviço:", srv.titulo);
                if (!newTitulo) return;
                const newDesc = prompt("Descrição do serviço:", srv.descricao);
                const newPreco = prompt("Preço base (apenas números):", srv.preco_base);
                const newImg = prompt("URL da imagem do serviço (opcional):", srv.imagem_url || '');

                setServices(services.map(s => s.id === srv.id ? {...s, titulo: newTitulo, descricao: newDesc || srv.descricao, preco_base: Number(newPreco) || srv.preco_base, imagem_url: newImg || ''} : s));
                showToast('Serviço atualizado com sucesso!');
            };

            const deleteService = (srvId) => {
                if(window.confirm("Deseja realmente excluir este serviço?")) {
                    setServices(services.filter(s => s.id !== srvId));
                    showToast('Serviço excluído!');
                }
            };

            return (
                <div className="pb-24 md:pb-8 animate-fade-in w-full">
                    <Header title="Gerenciar Catálogo" />
                    <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        <button onClick={addMockService} className="w-full h-full min-h-[160px] bg-white text-primary border-2 border-primary border-dashed rounded-3xl p-6 font-extrabold flex flex-col items-center justify-center gap-3 hover:bg-red-50 transition shadow-sm group">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><i className="ph-bold ph-plus text-3xl"></i></div>
                            Adicionar Novo Serviço
                        </button>

                        {myServices.map(srv => (
                            <div key={srv.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition relative group overflow-hidden flex flex-col">
                                {srv.imagem_url && <img src={srv.imagem_url} className="w-full h-32 object-cover" />}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => editService(srv)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition shadow-sm"><i className="ph-bold ph-pencil-simple text-sm"></i></button>
                                        <button onClick={() => deleteService(srv.id)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-red-500 hover:text-white transition shadow-sm"><i className="ph-bold ph-trash text-sm"></i></button>
                                    </div>
                                    <h3 className="font-extrabold text-dark text-lg mb-2 pr-16">{srv.titulo}</h3>
                                    <p className="text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100 flex-1">{srv.descricao}</p>
                                    <div className="flex items-end gap-2 mt-auto">
                                        <div className="text-xs font-bold text-gray-400 uppercase mb-1">Preço Base</div>
                                        <div className="font-extrabold text-primary text-2xl">R$ {srv.preco_base}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        };

        `;
content = content.replace(workerServicesCrudRegex, newWorkerServicesCrud);


// 6. Update handleSolicitar in WorkerProfileDetail
content = content.replace(
    /const handleSolicitar = \(\) => \{[\s\S]*?showToast\("Orçamento solicitado! O profissional receberá sua solicitação em breve\."\);\n\s*}\n\s*};/,
    `const handleSolicitar = () => {
                if(!currentUser) {
                    showToast("Por favor, faça login ou cadastre-se para solicitar um serviço.", "warning");
                    setCurrentView('LOGIN');
                } else if (currentUser.role === 'TRABALHADOR') {
                    showToast("Apenas clientes podem solicitar serviços.", "error");
                } else {
                    const activeRequests = orders.filter(o => o.contratante_id === currentUser.id && o.worker_id === workerId && ['PENDENTE', 'ACEITO', 'EM_ANDAMENTO'].includes(o.status));
                    if (activeRequests.length >= 2) {
                        showToast("Você já possui solicitações ativas demais com este profissional.", "warning");
                        return;
                    }
                    const newOrder = {
                        id: 'o' + Date.now(),
                        contratante_id: currentUser.id,
                        worker_id: workerId,
                        servico_id: workerServices[0]?.id || null,
                        status: 'PENDENTE',
                        data: new Date().toLocaleDateString('pt-BR'),
                        preco_final: workerServices[0]?.preco_base || 0,
                        chat_history: []
                    };
                    setOrders([...orders, newOrder]);
                    showToast("Orçamento solicitado! O profissional receberá sua solicitação em breve.");
                }
            };`
);


// 7. Change Avatars and Banners in WorkerProfileDetail, ProfileUser and WorkerProfileEdit
// In ProfileUser
content = content.replace(/const ProfileUser = \(\) => \{/, `const ProfileUser = () => {\n            const { users, setUsers, setContratanteDetails } = useAppStore();`);
content = content.replace(
    /<div className="relative">\s*<img src=\{currentUser\.foto_perfil_url\}.*?\/>\s*<button .*?><i className="ph-bold ph-pencil-simple text-base"><\/i><\/button>\s*<\/div>/,
    `<div className="relative">
                                <img src={currentUser.foto_perfil_url} className="w-32 h-32 rounded-full object-cover border-4 border-gray-50 shadow-md bg-white" />
                                <button onClick={() => {
                                    const url = prompt("Nova URL da foto de perfil:", currentUser.foto_perfil_url);
                                    if(url) setUsers(users.map(u => u.id === currentUser.id ? {...u, foto_perfil_url: url} : u));
                                }} className="absolute bottom-1 right-1 bg-primary text-white w-10 h-10 flex items-center justify-center rounded-full shadow-lg hover:bg-primaryDark transition border-2 border-white"><i className="ph-bold ph-pencil-simple text-base"></i></button>
                            </div>`
);

// WorkerProfileEdit
content = content.replace(
    /<img src=\{currentUser\.foto_perfil_url\}.*?\/>/,
    `<div className="relative flex-shrink-0">
                                <img src={currentUser.foto_perfil_url} className="w-28 h-28 rounded-3xl object-cover border-4 border-gray-50 shadow-md bg-white" />
                                <button onClick={() => {
                                    const url = prompt("Nova URL da foto de perfil:", currentUser.foto_perfil_url);
                                    if(url) setUsers(users.map(u => u.id === currentUser.id ? {...u, foto_perfil_url: url} : u));
                                }} className="absolute -bottom-2 -right-2 bg-primary text-white w-10 h-10 flex items-center justify-center rounded-xl shadow-lg hover:bg-primaryDark transition border-2 border-white"><i className="ph-bold ph-pencil-simple text-base"></i></button>
                            </div>`
);
content = content.replace(/<div className="p-8 flex flex-col md:flex-row items-center gap-6 bg-white rounded-3xl shadow-sm border border-gray-100 mb-6">/, 
    `<div className="mb-6 relative rounded-3xl shadow-sm border border-gray-100 overflow-hidden bg-white">
                            <div className="h-32 bg-dark relative">
                                <img src={details?.banner_url || 'https://i.imgur.com/3q1j3P7.png'} className="w-full h-full object-cover opacity-50" />
                                <button onClick={() => {
                                    const url = prompt("Nova URL da foto de capa (banner):", details?.banner_url || '');
                                    if(url) setWorkerDetails(workerDetails.map(d => d.user_id === currentUser.id ? {...d, banner_url: url} : d));
                                }} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-xl backdrop-blur transition border border-white/30"><i className="ph-bold ph-pencil-simple"></i> Alterar Capa</button>
                            </div>
                            <div className="p-8 flex flex-col md:flex-row items-center gap-6 -mt-16">`
);

// WorkerProfileDetail - Update banner img
content = content.replace(/<img src=\{details\.portfolio_fotos\[0\] \|\| worker\.foto_perfil_url\} className="w-full h-full object-cover opacity-40 mix-blend-overlay blur-sm scale-110" \/>/, 
    `<img src={details.banner_url || details.portfolio_fotos[0] || worker.foto_perfil_url} className="w-full h-full object-cover opacity-40 mix-blend-overlay blur-sm scale-110" />`
);


// 8. Add Reviews Tab to WorkerProfileDetail
content = content.replace(
    /const workerReviews = reviews\.filter\(r => r\.worker_id === workerId\);/,
    `const workerReviews = reviews.filter(r => r.worker_id === workerId);\n            const [activeTab, setActiveTab] = useState('SOBRE');\n            const { setReviews } = useAppStore();\n\n            const userFinishedOrders = currentUser ? orders.filter(o => o.contratante_id === currentUser.id && o.worker_id === workerId && o.status === 'CONCLUIDO') : [];\n            const canReview = userFinishedOrders.length > 0 && workerReviews.filter(r => r.user_id === currentUser?.id).length < userFinishedOrders.length;`
);

// Add Tab Buttons in WorkerProfileDetail
content = content.replace(
    /<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">/,
    `<div className="flex gap-4 border-b border-gray-200 mt-8 overflow-x-auto hide-scrollbar">
                            <button onClick={()=>setActiveTab('SOBRE')} className={\`pb-4 font-extrabold whitespace-nowrap border-b-4 transition \${activeTab === 'SOBRE' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-dark'}\`}>Serviços & Portfólio</button>
                            <button onClick={()=>setActiveTab('AVALIACOES')} className={\`pb-4 font-extrabold whitespace-nowrap border-b-4 transition \${activeTab === 'AVALIACOES' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-dark'}\`}>Avaliações ({workerReviews.length})</button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">`
);

// Wrap the main content based on activeTab
content = content.replace(
    /<div className="lg:col-span-2 space-y-8">([\s\S]*?)<div className="space-y-6">/g,
    `<div className="lg:col-span-2 space-y-8">
                                {activeTab === 'SOBRE' && (
                                    <>
$1
                                    </>
                                )}
                                {activeTab === 'AVALIACOES' && (
                                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-extrabold text-dark flex items-center gap-2"><i className="ph-fill ph-star text-warning"></i> Avaliações dos Clientes</h2>
                                            {canReview && (
                                                <button onClick={() => {
                                                    const notaStr = prompt("Dê uma nota de 1 a 5:");
                                                    const nota = Number(notaStr);
                                                    if(isNaN(nota) || nota < 1 || nota > 5) return showToast("Nota inválida", "error");
                                                    const texto = prompt("Deixe seu comentário sobre o serviço:");
                                                    if(!texto) return;
                                                    const img = prompt("URL de foto do resultado (opcional):");
                                                    const newReview = { id: 'r'+Date.now(), worker_id: workerId, user_id: currentUser.id, nota, comentario: texto, fotos: img ? [img] : [], data: new Date().toLocaleDateString('pt-BR') };
                                                    setReviews([...reviews, newReview]);
                                                    showToast("Avaliação enviada!");
                                                }} className="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition">Deixar Avaliação</button>
                                            )}
                                        </div>
                                        {workerReviews.length === 0 ? (
                                            <p className="text-gray-500 italic p-6 bg-gray-50 rounded-2xl text-center">Nenhuma avaliação ainda.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {workerReviews.map(r => {
                                                    const u = users.find(x => x.id === r.user_id);
                                                    return (
                                                        <div key={r.id} className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                                            <div className="flex justify-between mb-3">
                                                                <div className="flex items-center gap-3">
                                                                    <img src={u?.foto_perfil_url} className="w-10 h-10 rounded-full" />
                                                                    <div>
                                                                        <div className="font-extrabold text-dark text-sm">{u?.nome}</div>
                                                                        <div className="text-[10px] text-gray-500 font-bold">{r.data}</div>
                                                                    </div>
                                                                </div>
                                                                <StarRating rating={r.nota} />
                                                            </div>
                                                            <p className="text-gray-600 text-sm">{r.comentario}</p>
                                                            {r.fotos?.length > 0 && (
                                                                <div className="flex gap-2 mt-3">
                                                                    {r.fotos.map((f, i) => <img key={i} src={f} className="w-16 h-16 rounded-xl object-cover border border-gray-200" />)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-6">`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Update completed successfully.');
