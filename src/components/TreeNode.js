import React from 'react';
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Edit as EditIcon,
  AddCircleOutline as AddIcon,
  Delete as DeleteIcon,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import './TreeNode.css';

const TreeNode = ({ node, level, onEdit, onCreate, onDelete, onToggle, onExpand, openNodes }) => {
  const isOpen = openNodes.has(node.id);

  return (
    <React.Fragment key={node.id}>
      <ListItem
        className="list-item"
        style={{ paddingLeft: 16 * level }}
        onClick={() => node.children && node.children.length > 0 && onExpand(node.id)}
      >
        {node.children && node.children.length > 0 && (
          <IconButton onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}>
            {isOpen ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        )}
        <ListItemText primary={node.name} className="list-item-content" />
        <ListItemSecondaryAction className="list-item-actions">
          <IconButton edge="end" onClick={(e) => { e.stopPropagation(); onEdit(node); }}>
            <EditIcon />
          </IconButton>
          <IconButton edge="end" onClick={(e) => { e.stopPropagation(); onCreate(node.id); }}>
            <AddIcon />
          </IconButton>
          <IconButton edge="end" onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}>
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
      {isOpen && node.children && (
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onEdit={onEdit}
              onCreate={onCreate}
              onDelete={onDelete}
              onToggle={onToggle}
              onExpand={onExpand}
              openNodes={openNodes}
            />
          ))}
        </Collapse>
      )}
    </React.Fragment>
  );
};

export default TreeNode;
