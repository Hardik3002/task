import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function Landing({ state }) {
    const { contract, account } = state;
    const [campaigns, setCampaigns] = useState([]);
    const [goal, setGoal] = useState('');
    const [contribution, setContribution] = useState('');
    const [withdrawCampaignId, setWithdrawCampaignId] = useState('');
    const [deadline, setDeadline] = useState(''); // Accept deadline in seconds
    const [cancelCampaignId, setCancelCampaignId] = useState('');

    // Fetch all campaigns
    const fetchCampaigns = async () => {
        if (contract) {
            try {
                const count = await contract.campaignCount();
                const campaignData = [];
                for (let i = 1; i <= count; i++) {
                    const details = await contract.getCampaign(i);
                    const remainingTime = parseInt(details[1]);
                    const goal = ethers.utils.formatEther(details[2]);
                    const totalFunds = ethers.utils.formatEther(details[3]);
                    const fundsNeeded = parseFloat(goal) - parseFloat(totalFunds);

                    campaignData.push({
                        id: i,
                        creator: details[0],
                        remainingTime,
                        goal,
                        totalFunds,
                        fundsNeeded: fundsNeeded > 0 ? fundsNeeded.toFixed(2) : 0,
                    });
                }
                setCampaigns(campaignData);
            } catch (err) {
                console.error("Error fetching campaigns:", err);
            }
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, [contract]);

    // Contribute to a campaign
    const contributeToCampaign = async (campaignId) => {
        if (contract) {
            try {
                const tx = await contract.contribute(campaignId, { value: ethers.utils.parseEther(contribution) });
                await tx.wait();
                console.log("Contribution successful");
                fetchCampaigns(); // Refresh the campaign list
            } catch (err) {
                console.error("Error contributing:", err);
            }
        }
    };

    // Withdraw funds
    const withdrawFunds = async () => {
        if (contract && withdrawCampaignId) {
            try {
                const tx = await contract.withdrawFunds(withdrawCampaignId);
                await tx.wait();
                console.log("Funds withdrawn");
                fetchCampaigns(); // Refresh the campaign list
            } catch (err) {
                console.error("Error withdrawing funds:", err);
            }
        }
    };

    // Create a new campaign with deadline
    const createCampaign = async () => {
        if (contract) {
            try {
                const deadlineInSeconds = parseInt(deadline, 10); // Use the entered seconds directly
                const tx = await contract.createCampaign(deadlineInSeconds, { value: ethers.utils.parseEther(goal) });
                await tx.wait();
                console.log("Campaign created successfully");
                fetchCampaigns(); // Refresh the campaign list
            } catch (err) {
                console.error("Error creating campaign:", err);
            }
        }
    };

    // Cancel contribution to a campaign
    const cancelContribution = async () => {
        if (contract && cancelCampaignId) {
            try {
                const tx = await contract.cancelContribution(cancelCampaignId);
                await tx.wait();
                console.log("Contribution canceled");
                fetchCampaigns(); // Refresh the campaign list
            } catch (err) {
                console.error("Error canceling contribution:", err);
            }
        }
    };

    // Format remaining time in a human-readable format
    const formatTime = (seconds) => {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${days}d ${hours}h ${minutes}m ${secs}s`;
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h1>Welcome to the Crowdfunding DApp</h1>

            <div style={{ marginBottom: '20px' }}>
                <h2>Create a New Campaign</h2>
                <input
                    type="text"
                    placeholder="Goal (in Ether)"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    style={{ padding: '10px', marginRight: '10px', width: '200px' }}
                />
                <input
                    type="text"
                    placeholder="Deadline (in seconds)"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    style={{ padding: '10px', marginRight: '10px', width: '200px' }}
                />
                <button onClick={createCampaign} style={{ padding: '10px 20px', cursor: 'pointer' }}>Create Campaign</button>
            </div>

            <div>
                <h2>All Campaigns</h2>
                {campaigns.length > 0 ? (
                    <ul style={{ listStyleType: 'none', padding: '0' }}>
                        {campaigns.map((campaign) => (
                            <li key={campaign.id} style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                                <h3>Campaign ID: {campaign.id}</h3>
                                <p>Creator: {campaign.creator}</p>
                                <p>Remaining Time: {formatTime(campaign.remainingTime)}</p>
                                <p>Goal: {campaign.goal} ETH</p>
                                <p>Total Funds: {campaign.totalFunds} ETH</p>
                                <p>Funds Needed: {campaign.fundsNeeded} ETH</p>
                                <input
                                    type="text"
                                    placeholder="Contribution (in Ether)"
                                    value={contribution}
                                    onChange={(e) => setContribution(e.target.value)}
                                    style={{ padding: '10px', marginRight: '10px', width: '200px' }}
                                />
                                <button onClick={() => contributeToCampaign(campaign.id)} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                                    Contribute
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No campaigns found.</p>
                )}
            </div>

            <div style={{ marginTop: '20px' }}>
                <h2>Withdraw Funds</h2>
                <input
                    type="text"
                    placeholder="Campaign ID"
                    value={withdrawCampaignId}
                    onChange={(e) => setWithdrawCampaignId(e.target.value)}
                    style={{ padding: '10px', marginRight: '10px', width: '200px' }}
                />
                <
button onClick={withdrawFunds} style={{ padding: '10px 20px', cursor: 'pointer' }}>Withdraw</button>
            </div>

            <div style={{ marginTop: '20px' }}>
                <h2>Cancel Contribution</h2>
                <input
                    type="text"
                    placeholder="Campaign ID"
                    value={cancelCampaignId}
                    onChange={(e) => setCancelCampaignId(e.target.value)}
                    style={{ padding: '10px', marginRight: '10px', width: '200px' }}
                />
                <button onClick={cancelContribution} style={{ padding: '10px 20px', cursor: 'pointer' }}>Cancel Contribution</button>
            </div>
        </div>
    );
}