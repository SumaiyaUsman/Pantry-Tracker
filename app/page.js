"use client"
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Button, Modal, Stack, TextField, Typography, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { collection, deleteDoc, doc, query, setDoc, getDocs, getDoc } from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const sortedInventory = [...inventory].sort((a, b) => {
    switch (sortOption) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "quantity-asc":
        return a.quantity - b.quantity;
      case "quantity-desc":
        return b.quantity - a.quantity;
      default:
        return 0;
    }
  });

  const filteredInventory = sortedInventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex" 
      flexDirection="column"
      justifyContent="flex-start" 
      alignItems="center" 
      gap={2}
    >
      <Box 
        width="100%" 
        height="100px" 
        bgcolor="#ADD8E6" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        mb={2}
      >
        <Typography variant="h2" color="#333">
          Pantry Items
        </Typography>
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box 
          position="absolute" 
          top="50%" 
          left="50%" 
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%,-50%)",
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
              }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName("");
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen} sx={{ mb: 2 }}>
        Add New Item
      </Button>
      <Stack direction="row" spacing={2} mb={2} alignItems="center" width="800px">
        <TextField
          variant="outlined"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <FormControl variant="outlined" sx={{ width: "200px" }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortOption}
            onChange={handleSortChange}
            label="Sort By"
          >
            <MenuItem value="name-asc">Name (A-Z)</MenuItem>
            <MenuItem value="name-desc">Name (Z-A)</MenuItem>
            <MenuItem value="quantity-asc">Quantity (Low to High)</MenuItem>
            <MenuItem value="quantity-desc">Quantity (High to Low)</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Box border="1px solid #333">
        <Stack width="800px" height="300px" spacing={2} overflow="auto">
          {filteredInventory.map(({ name, quantity }) => (
            <Box 
              key={name} 
              width="100%" 
              minHeight="150px" 
              display="flex" 
              alignItems="center" 
              justifyContent="space-between"
              bgcolor="#f0f0f0"
              padding={5}
            >
              <Typography variant="h3" color="#333" textAlign="center">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="h3" color="#333" textAlign="center">
                {quantity}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={() => addItem(name)}>
                  Add
                </Button>
                <Button variant="contained" onClick={() => removeItem(name)}>
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
