const Agent = require('../models/Agent');
const Contact = require('../models/Contact');

exports.getOptimalAgentDistribution = async (contacts, agents) => {
  // Get current workload for each agent
  const workloads = await Promise.all(
    agents.map(async (agent) => ({
      agent: agent._id,
      currentLoad: await Contact.countDocuments({ 
        assignedTo: agent._id,
        status: { $nin: ['completed', 'rejected'] }
      })
    }))
  );

  // Sort agents by current workload
  workloads.sort((a, b) => a.currentLoad - b.currentLoad);

  const distribution = new Map();
  
  // Distribute contacts evenly based on workload
  for (const contact of contacts) {
    // Get agent with least current tasks
    const targetAgent = workloads[0].agent;

    // Add contact to agent's distribution
    if (!distribution.has(targetAgent)) {
      distribution.set(targetAgent, []);
    }
    distribution.get(targetAgent).push(contact);

    // Update workload count and resort
    workloads[0].currentLoad++;
    workloads.sort((a, b) => a.currentLoad - b.currentLoad);
  }

  return distribution;
};
