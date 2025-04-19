import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar, CreditCard, CheckCircle, Clock } from 'lucide-react';

const FeePayment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock fee data (in KSh)
  const feeData = [
    { id: 1, description: 'Tuition Fee', amount: 250000, dueDate: '2023-09-15', status: 'paid' },
    { id: 2, description: 'Library Fee', amount: 15000, dueDate: '2023-09-20', status: 'paid' },
    { id: 3, description: 'Technology Fee', amount: 30000, dueDate: '2023-10-01', status: 'pending' },
    { id: 4, description: 'Activity Fee', amount: 20000, dueDate: '2023-10-05', status: 'pending' },
  ];

  const totalPaid = feeData.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);
  const totalDue = feeData.filter(fee => fee.status === 'pending').reduce((sum, fee) => sum + fee.amount, 0);

  const handlePayment = () => {
    toast({
      title: "Payment successful!",
      description: `KSh ${totalDue} has been paid via Card.`,
    });
    setTimeout(() => navigate('/student/dashboard'), 2000);
  };

  const handleMpesaPayment = (phone) => {
    toast({
      title: "Payment initiated!",
      description: `KSh ${totalDue} payment request sent to ${phone} via M-Pesa.`,
    });
    setTimeout(() => navigate('/student/dashboard'), 2000);
  };

  const handleBankPayment = () => {
    toast({
      title: "Payment instructions sent!",
      description: `Please transfer KSh ${totalDue} to the bank account.`,
    });
    setTimeout(() => navigate('/student/dashboard'), 2000);
  };

  const statusColor = (status) => {
    return status === 'paid' ? 'bg-green-700 text-green-100' : 'bg-yellow-700 text-yellow-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121212] to-[#121212] text-white pb-20">
      <Header />
      <Toaster />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-white text-center md:text-left">Fee Payment</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#0c0c0c] border border-gray-800 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-[#00ffd0] mr-2" />
                <span className="text-2xl font-bold text-white">KSh {totalPaid}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0c0c0c] border border-gray-800 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white">Due Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-[#ff5555] mr-2" />
                <span className="text-2xl font-bold text-white">KSh {totalDue}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0c0c0c] border border-gray-800 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white">Next Due Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-[#0062ff] mr-2" />
                <span className="text-2xl font-bold text-white">Oct 1, 2023</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#0c0c0c] border border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Fee Details</CardTitle>
            <CardDescription className="text-gray-400">
              View and manage your fee payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-[#151515]">
                  <TableHead className="text-gray-400">Description</TableHead>
                  <TableHead className="text-gray-400">Amount</TableHead>
                  <TableHead className="text-gray-400">Due Date</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeData.map((fee) => (
                  <TableRow key={fee.id} className="border-gray-800 hover:bg-[#151515]">
                    <TableCell className="text-white">{fee.description}</TableCell>
                    <TableCell className="text-white">KSh {fee.amount}</TableCell>
                    <TableCell className="text-gray-400">{fee.dueDate}</TableCell>
                    <TableCell>
                      <Badge 
                        className={`${
                          fee.status === 'paid' 
                            ? 'bg-[#00ffd0]/10 text-[#00ffd0] hover:bg-[#00ffd0]/20' 
                            : 'bg-[#ff5555]/10 text-[#ff5555] hover:bg-[#ff5555]/20'
                        }`}
                      >
                        {fee.status === 'paid' ? 'Paid' : 'Pending'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold text-white">Payment Options</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="bg-[#0062ff] w-full shadow-lg shadow-[#0062ff]/30 transform hover:scale-105 active:scale-95">
                  Pay Now (Card)
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#0c0c0c] text-white border-gray-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Confirm Card Payment</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    You will be redirected to the payment gateway to complete your payment of KSh {totalDue}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-[#151515] text-white border-gray-800">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handlePayment}
                    className="bg-[#0062ff] shadow-lg shadow-[#0062ff]/30 transform hover:scale-105 active:scale-95"
                  >
                    Proceed to Payment
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="bg-[#00ffd0] text-black w-full shadow-lg shadow-[#00ffd0]/30 transform hover:scale-105 active:scale-95">
                  Pay Now (M-Pesa)
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#0c0c0c] text-white border-gray-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Confirm M-Pesa Payment</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    Enter your M-Pesa phone number to pay KSh {totalDue}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Input
                  id="mpesa-phone"
                  placeholder="e.g., 0712 345 678"
                  className="bg-[#151515] border-gray-800 text-white my-4"
                />
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-[#151515] text-white border-gray-800">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleMpesaPayment(document.getElementById('mpesa-phone')?.value || 'unknown')}
                    className="bg-[#00ffd0] text-black shadow-lg shadow-[#00ffd0]/30 transform hover:scale-105 active:scale-95"
                  >
                    Confirm Payment
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="bg-[#ffcb6b] text-black w-full shadow-lg shadow-[#ffcb6b]/30 transform hover:scale-105 active:scale-95">
                  Bank Transfer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#0c0c0c] text-white border-gray-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Bank Transfer Details</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    Please transfer KSh {totalDue} to the following bank account:
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="bg-[#151515] p-4 rounded-lg my-4">
                  <p className="text-sm text-gray-400">Bank: Equity Bank</p>
                  <p className="text-sm text-gray-400">Account Name: University Name</p>
                  <p className="text-sm text-gray-400">Account Number: 1234567890</p>
                  <p className="text-sm text-gray-400">Branch: Main Branch</p>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-[#151515] text-white border-gray-800">Close</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBankPayment}
                    className="bg-[#ffcb6b] text-black shadow-lg shadow-[#ffcb6b]/30 transform hover:scale-105 active:scale-95"
                  >
                    I've Made the Transfer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FeePayment;