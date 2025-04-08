import React, { useMemo, useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "react-flow-renderer";
import dagre from "dagre";
import {
  CCard,
  CCardBody,
  CCardHeader,
} from "@coreui/react";
import { useParams } from "react-router-dom";
import axios from "axios";

const nodeWidth = 150;
const nodeHeight = 60;

const getLayoutedElements = (nodes, edges, direction = "TB") => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? "left" : "top";
    node.sourcePosition = isHorizontal ? "right" : "bottom";
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
};

const ViewNavigationChart = () => {
  const rootId = "root";
  const { channelId, navigationId } = useParams();
  const url = import.meta.env.VITE_USERS_API_URL;

  const [navItems, setNavItems] = useState([]);
  const [level, setLevel] = useState("1");

  useEffect(() => {
    if (!navigationId) return;

    const getNavigationData = async () => {
      try {
        const response = await axios.post(`${url}/admin/module/details`, {
          moduleType: "navigation",
          moduleId: navigationId,
          channelId,
        });
        const data = response.data.data;
        setNavItems(data || []);
        if (data.length > 0) setLevel(data[0].level.toString());
      } catch (error) {
        console.error("Error fetching navigation:", error);
      }
    };

    getNavigationData();
  }, [navigationId, channelId, url]);

  const layouted = useMemo(() => {
    const nodes = [
      {
        id: rootId,
        data: { label: `Level ${level} Nav` },
        position: { x: 0, y: 0 },
      },
      ...navItems.map((item) => ({
        id: item._id,
        data: { label: item.title },
        position: { x: 0, y: 0 },
      })),
    ];

    const edges = navItems.map((item) => ({
      id: `e-${item.parentId || rootId}-${item._id}`,
      source: item.parentId || rootId,
      target: item._id,
      type: "smoothstep",
    }));

    return getLayoutedElements(nodes, edges);
  }, [navItems, level]);

  const [nodesState, setNodes, onNodesChange] = useNodesState(layouted.nodes);
  const [edgesState, setEdges, onEdgesChange] = useEdgesState(layouted.edges);

  // Keep nodes/edges in sync when layouted changes
  useEffect(() => {
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
  }, [layouted]);

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h3 className="m-0">View Navigation Chart</h3>
      </CCardHeader>
      <CCardBody>
        <div style={{ width: "100%", height: "450px" }}>
          <ReactFlow
            nodes={nodesState}
            edges={edgesState}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </CCardBody>
    </CCard>
  );
};

export default ViewNavigationChart;
