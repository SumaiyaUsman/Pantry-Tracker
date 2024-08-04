"use client"
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
import { collection, deleteDoc, doc, query, setDoc, getDocs, getDoc } from "firebase/firestore";
import axios from "axios";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);

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

  const getRecipeSuggestions = async () => {
    const itemNames = inventory.map(item => item.name).join(", ");
    const prompt = `Suggest a recipe based on the following pantry items: ${itemNames}`;
    
    console.log("Fetching recipes with prompt:", prompt); // Debugging

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/engines/llama-3.1-8b-instant/completions',
        {
          prompt: prompt,
          max_tokens: 150,
        },
        {
          headers: {
            'Authorization': `Bearer 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`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log("API response:", response.data); // Debugging

      setRecipes(response.data.choices[0].text.trim().split('\n'));
      setRecipeModalOpen(true); // Open the recipe modal when suggestions are available
    } catch (error) {
      console.error("Error fetching recipe suggestions:", error);
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleRecipeModalClose = () => setRecipeModalOpen(false);

  const filteredInventory = inventory.filter(item => 
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
      <Button variant="contained" onClick={handleOpen}>
        Add New Item
      </Button>
      <TextField
        variant="outlined"
        placeholder="Search items..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ marginBottom: 2, width: "800px" }}
      />
      <Button variant="contained" onClick={getRecipeSuggestions}>
        Get Recipe Suggestions
      </Button>
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
      <Modal open={recipeModalOpen} onClose={handleRecipeModalClose}>
        <Box 
          position="absolute" 
          top="50%" 
          left="50%" 
          width={600}
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
          <Typography variant="h4" color="#333" mb={2}>
            Recipe Suggestions
          </Typography>
          <Stack spacing={1}>
            {recipes.map((recipe, index) => (
              <Typography key={index} variant="body1" color="#333">
                {recipe}
              </Typography>
            ))}
          </Stack>
          <Button variant="contained" onClick={handleRecipeModalClose}>
            Close
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
