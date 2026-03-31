// Purpose: Allows any authenticated user to create or update a worker profile and enable worker mode.
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ProfileForm from '../components/worker/ProfileForm';
import { workerService } from '../services';

const WorkerSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      await workerService.createWorkerProfile({
        ...formData,
        serviceAreas: formData.location ? [formData.location] : undefined
      });
      toast.success('Worker profile saved successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error || 'Failed to save worker profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 pt-24">
      <h1 className="text-2xl font-bold mb-6">Create Worker Profile</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <ProfileForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
};

export default WorkerSetup;
