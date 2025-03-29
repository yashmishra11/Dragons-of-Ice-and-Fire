import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./DragonDetail.css";


const DragonDetail = () => {
  const { name } = useParams();
  const [dragons, setDragons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/dragon_data.json") // Fetch the JSON file from the public folder
      .then((response) => response.json())
      .then((data) => {
        setDragons(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading dragon data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <h2>Loading...</h2>;

  const dragon = dragons.find((d) => d.name === name);

  if (!dragon) return <h2>Dragon not found</h2>;

  return (
    <div className="dragon-detail">
      <img src={dragon.image} alt={dragon.name} />
      <h1>{dragon.name}</h1><br />
      <p><strong>Hatched:</strong> {dragon.hatched}</p><br />
      <p><strong>Died:</strong> {dragon.died || "N/A"}</p><br />
      <p><strong>Rider:</strong> {dragon.rider}</p><br />
      <p><strong>Colors:</strong> {dragon.colors}</p><br />
      <p><strong>Description:</strong> {dragon.discription}</p><br />
      <p><strong>History:</strong> {dragon.history}</p>
    </div>
  );
};

export default DragonDetail;
