import { createApp, ref, useTemplateRef, nextTick } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

createApp({
	setup() {
		const taskTitle = ref('');
		const taskDescription = ref('');
		const tasks = ref([]);
		const userCount = ref(0);
		const messages = ref([]);
		const message = ref('');
		const username = ref('');
		const canChat = ref(false);
		const view = ref('list'); // 'list' or 'create'
		const messagesElement = useTemplateRef('messagesElement');

		const toggleView = () => {
			view.value = view.value === 'list' ? 'create' : 'list';
		};

		const createTask = async () => {
			const response = await fetch('/api/tasks', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					title: taskTitle.value,
					description: taskDescription.value,
				}),
			});
			if (response.ok) {
				taskTitle.value = '';
				taskDescription.value = '';
				toggleView();
			} else {
				console.error('Failed to create task');
			}
		};

		const refreshTasks = async () => {
			const response = await fetch('/api/tasks');
			if (response.ok) {
				tasks.value = await response.json();
			}
		};

		const refreshMessages = async () => {
			const response = await fetch('/api/messages');
			if (response.ok) {
				messages.value = await response.json();
			}
		};

		const toggleTask = async (task) => {
			await fetch(`/api/tasks/${task.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ completed: !task.completed }),
			});
		}

		const deleteTask = async (task) => {
			await fetch(`/api/tasks/${task.id}`, {
				method: 'DELETE',
			});
		};

		const handleMessage = event => {
			const message = JSON.parse(event.data);
			if (message.command === 'refresh') {
				refreshTasks();
			} else if (message.command === 'userCount') {
				userCount.value = message.context.count;
			} else if (message.command === 'message') {
				messages.value.push(message.context);
				messagesElement.value.scrollTop = messagesElement.value.scrollHeight;
			}
		};

		const sendMessage = () => {
			if (message.value.trim() === '') return;

			const packet = {
				command: 'chat:send',
				context: {
					username: username.value,
					message: message.value,
				},
			};

			window.$ws.send(JSON.stringify(packet));
			messages.value.push(packet.context);
			message.value = '';
			messagesElement.value.scrollTop = messagesElement.value.scrollHeight;
		};

		const setUsername = () => {
			if (username.value.trim() === '') {
				alert('Username cannot be empty');
				return;
			}
			canChat.value = true;
			nextTick(() => {
				messagesElement.value.scrollTop = messagesElement.value.scrollHeight;
			});
		};

		return {
			view,
			tasks,
			canChat,
			message,
			messages,
			username,
			userCount,
			taskTitle,
			taskDescription,
			createTask,
			toggleTask,
			deleteTask,
			toggleView,
			sendMessage,
			setUsername,
			refreshTasks,
			handleMessage,
			refreshMessages,
		};
	},

	created() {

		// Initial fetch to populate tasks & messages.
		this.refreshTasks();
		this.refreshMessages();

		// Setup the WebSocket connection.
		window.$ws = new WebSocket(`ws://${window.location.host}/ws`);
		window.$ws.onmessage = this.handleMessage.bind(this);
	},

	beforeUnmount() {
		if (window.$ws) window.$ws.close();
	},
}).mount('#app');
