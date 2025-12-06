document.getElementById('submit-btn').addEventListener('click', async () => {
    const repo = document.getElementById('repo').value.trim();
    let shortCode = document.getElementById('short-code').value.trim();
    const longUrl = document.getElementById('long-url').value.trim();
    const pat = document.getElementById('pat').value.trim();
    const messageDiv = document.getElementById('message');

    // --- 输入验证 ---
    if (!repo || !shortCode || !longUrl || !pat) {
        showMessage('所有字段均为必填项。', 'error');
        return;
    }
    if (!/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/.test(repo)) {
        showMessage('仓库格式不正确，应为 "user/repo"。', 'error');
        return;
    }
    // 自动为 shortCode 添加前导斜杠
    if (shortCode && !shortCode.startsWith('/')) {
        shortCode = '/' + shortCode;
    }
    try {
        new URL(longUrl);
    } catch (_) {
        showMessage('目标长链接不是一个有效的 URL。', 'error');
        return;
    }

    const apiUrl = `https://api.github.com/repos/${repo}/contents/data/links.json`;
    const headers = {
        'Authorization': `token ${pat}`,
        'Accept': 'application/vnd.github.v3+json',
    };

    showMessage('正在处理...', 'info'); // 可以添加一个 info 样式
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;

    try {
        // 1. 获取当前文件内容和 SHA
        let fileSha, currentLinks = {};
        const getResponse = await fetch(apiUrl, { headers });

        if (getResponse.status === 404) {
            // 文件不存在，这是第一次创建
            console.log('links.json 不存在，将创建新文件。');
        } else if (getResponse.ok) {
            const data = await getResponse.json();
            fileSha = data.sha;
            // GitHub API 返回的内容是 Base64 编码的
            const content = atob(data.content);
            currentLinks = JSON.parse(content);
        } else {
            throw new Error(`获取文件失败: ${getResponse.statusText}`);
        }

        // 2. 更新 JSON 数据
        currentLinks[shortCode] = longUrl;
        const updatedContent = JSON.stringify(currentLinks, null, 4);
        // 需要将更新后的内容编码为 Base64
        const updatedContentBase64 = btoa(updatedContent);

        // 3. 推送更新到 GitHub
        const putResponse = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `feat: add or update link for ${shortCode}`,
                content: updatedContentBase64,
                sha: fileSha, // 如果是新文件，则不提供 sha
            }),
        });

        if (putResponse.ok) {
            showMessage('链接已成功添加/更新！', 'success');
            // 清空表单
            document.getElementById('short-code').value = '';
            document.getElementById('long-url').value = '';
        } else {
            const errorData = await putResponse.json();
            throw new Error(`更新文件失败: ${errorData.message}`);
        }

    } catch (error) {
        console.error('操作失败:', error);
        showMessage(`操作失败: ${error.message}`, 'error');
    } finally {
        submitBtn.disabled = false;
    }
});

function showMessage(msg, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = msg;
    messageDiv.className = type; // 'success' or 'error'
    messageDiv.style.display = 'block';
}