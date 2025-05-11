import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import axios from 'axios';
import './InstructorEwallet.css';

const InstructorEwallet = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [showBalanceDialog, setShowBalanceDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const url = 'http://localhost:8000/api/accounts/instructors/students/';
      const token = localStorage.getItem('access_token');
      console.log('Fetching students from:', url);
      console.log('Current access token:', token);
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Students response:', response.data);
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      console.error('Error response:', error.response);
      setError('Failed to load students. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBalance = (student) => {
    setSelectedStudent(student);
    setBalanceAmount(student.ewallet?.balance || '0');
    setShowBalanceDialog(true);
  };

  const handleBalanceSubmit = async () => {
    try {
      // First update the e-wallet balance
      await axios.patch(`/api/ewallets/${selectedStudent.ewallet.id}/`, {
        balance: parseFloat(balanceAmount)
      });

      // Then create a transaction record
      await axios.post('/api/transactions/', {
        ewallet: selectedStudent.ewallet.id,
        amount: parseFloat(balanceAmount) - (selectedStudent.ewallet?.balance || 0),
        transaction_type: 'balance_adjustment',
        description: 'Balance adjusted by instructor',
        status: 'completed'
      });

      setSuccessMessage(`Successfully updated balance for ${selectedStudent.user.first_name} ${selectedStudent.user.last_name}`);
      setShowBalanceDialog(false);
      setBalanceAmount('');
      setSelectedStudent(null);
      
      // Refresh student data to show updated balances
      fetchStudents();
    } catch (error) {
      console.error('Failed to update balance:', error);
      setError('Failed to update balance. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Student E-Wallets
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Student ID</TableCell>
              <TableCell>Program</TableCell>
              <TableCell>Current Balance</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  {student.user.first_name} {student.user.last_name}
                </TableCell>
                <TableCell>{student.student_id}</TableCell>
                <TableCell>{student.program}</TableCell>
                <TableCell>₹{student.ewallet?.balance?.toFixed(2) || '0.00'}</TableCell>
                <TableCell>
                  <Tooltip title="Edit Balance">
                    <IconButton
                      color="primary"
                      onClick={() => handleEditBalance(student)}
                    >
                      <AccountBalanceWalletIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={showBalanceDialog} onClose={() => setShowBalanceDialog(false)}>
        <DialogTitle>Update Student Balance</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            {selectedStudent?.user?.first_name} {selectedStudent?.user?.last_name}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="New Balance"
            type="number"
            fullWidth
            value={balanceAmount}
            onChange={(e) => setBalanceAmount(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBalanceDialog(false)}>Cancel</Button>
          <Button onClick={handleBalanceSubmit} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InstructorEwallet; 