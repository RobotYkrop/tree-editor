import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  CircularProgress,
  Alert,
  Container,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  List
} from '@mui/material';
import TreeNode from './components/TreeNode';

const BASE_URL = 'https://test.vmarmysh.com';

const App = () => {
  const [nodes, setNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [treeName] = useState('myTree');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openNodes, setOpenNodes] = useState(new Set());

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${BASE_URL}/api.user.tree.get`, null, {
        params: { treeName }
      });
      const nodesWithState = response.data.children || [];
      setNodes(nodesWithState.map(node => ({ ...node, isOpen: openNodes.has(node.id) })));
      setLoading(false);

      if (nodesWithState.length === 0) {
        setConfirmAction(() => () => handleCreateNode(response.data.id));
        setShowConfirmDialog(true);
      }
    } catch (err) {
      console.error(err);
      setError("Ошибка загрузки дерева");
      setLoading(false);
    }
  };

  const handleCreateNode = (parentId) => {
    setCurrentNode({ id: null, parentId, name: '' });
    setShowEditDialog(true);
  };

  const handleEditNode = (node) => {
    setCurrentNode(node);
    setShowEditDialog(true);
  };

  const handleSave = async () => {
    const isCreating = !currentNode.id;

    const url = isCreating
      ? `${BASE_URL}/api.user.tree.node.create`
      : `${BASE_URL}/api.user.tree.node.rename`;

    const params = isCreating
      ? {
          treeName,
          parentNodeId: currentNode.parentId,
          nodeName: currentNode.name,
        }
      : {
          treeName,
          nodeId: currentNode.id,
          newNodeName: currentNode.name,
        };

    try {
      await axios.post(url, null, { params });
      setShowEditDialog(false);
      fetchTree();
    } catch (err) {
      console.error("Error occurred while saving the node:", err.message);
      setError("Ошибка сохранения узла: " + (err.response ? err.response.data : err.message));
    }
  };

  const handleDeleteNode = (nodeId) => {
    setConfirmAction(() => () => {
      axios.post(`${BASE_URL}/api.user.tree.node.delete`, null, {
        params: { treeName, nodeId }
      })
        .then(() => {
          fetchTree();
          setOpenNodes(prevOpenNodes => {
            const newOpenNodes = new Set(prevOpenNodes);
            newOpenNodes.delete(nodeId);
            return newOpenNodes;
          });
        })
        .catch(err => {
          console.error(err);
          setError("Ошибка удаления узла");
        });
    });
    setShowConfirmDialog(true);
  };

  const toggleExpand = (nodeId) => {
    setOpenNodes(prevOpenNodes => {
      const newOpenNodes = new Set(prevOpenNodes);
      if (newOpenNodes.has(nodeId)) {
        newOpenNodes.delete(nodeId);
      } else {
        newOpenNodes.add(nodeId);
      }
      setNodes(nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, isOpen: newOpenNodes.has(nodeId) };
        }
        if (node.children) {
          return { ...node, children: toggleChildrenExpand(node.children, nodeId, newOpenNodes) };
        }
        return node;
      }));
      return newOpenNodes;
    });
  };

  const toggleChildrenExpand = (children, nodeId, openNodes) => {
    return children.map(child => {
      if (child.id === nodeId) {
        return { ...child, isOpen: openNodes.has(nodeId) };
      }
      if (child.children) {
        return { ...child, children: toggleChildrenExpand(child.children, nodeId, openNodes) };
      }
      return child;
    });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Дерево узлов
      </Typography>
      
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      <List component="div" disablePadding>
        {nodes.map(node => (
          <TreeNode
            key={node.id}
            node={node}
            level={0}
            onEdit={handleEditNode}
            onCreate={handleCreateNode}
            onDelete={handleDeleteNode}
            onToggle={toggleExpand}
            onExpand={toggleExpand}
            openNodes={openNodes}
          />
        ))}
      </List>

      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)}>
        <DialogTitle>{currentNode?.id ? "Редактировать узел" : "Создать новый узел"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Имя узла"
            value={currentNode?.name || ''}
            onChange={e => setCurrentNode({ ...currentNode, name: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Отмена</Button>
          <Button onClick={handleSave} color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Подтверждение</DialogTitle>
        <DialogContent>
          <Typography>
            {confirmAction ? (currentNode ? "Вы уверены, что хотите удалить этот узел?" : "Вы уверены, что хотите создать первый узел?") : ""}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Отмена</Button>
          <Button onClick={() => {
            if (confirmAction) confirmAction();
            setShowConfirmDialog(false);
          }} color="primary">
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default App;